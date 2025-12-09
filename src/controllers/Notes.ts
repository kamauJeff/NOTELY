import { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

// Helper to ensure valid ID
const ensureId = (idParam: string | undefined) => {
  if (!idParam || typeof idParam !== "string") return null;
  return idParam;
};

// CREATE NOTE
export const createNote = async (req: Request, res: Response) => {
  try {
    const { entryTitle, synopsis, content } = req.body;
    if (!entryTitle || !content) {
      return res.status(400).json({ message: "Entry title and content are required" });
    }

    const note = await client.entry.create({
      data: {
        entryTitle,
        synopsis,
        content,
        userId: req.user.id,
        isDeleted: false,
      },
    });

    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET ALL NON-DELETED NOTES WITH PINNED/BOOKMARKED STATUS
export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const notes = await client.entry.findMany({
      where: { 
        userId, 
        isDeleted: false 
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        pinnedBy: {
          where: { userId },
          select: { id: true }
        },
        bookmarks: {
          where: { userId },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response to include pinned/bookmarked status
    const formattedNotes = notes.map(note => ({
      id: note.id,
      entryTitle: note.entryTitle,
      synopsis: note.synopsis,
      content: note.content,
      userId: note.userId,
      authorFirstName: note.user.firstName,
      authorLastName: note.user.lastName,
      createdAt: note.createdAt,
      updatedAt: note.lastUpdated,
      pinned: note.pinnedBy.length > 0, // Check if user has pinned this note
      bookmarked: note.bookmarks.length > 0 // Check if user has bookmarked this note
    }));

    res.status(200).json(formattedNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET SINGLE NOTE WITH PINNED/BOOKMARKED STATUS
export const getNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const id = ensureId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid note ID" });

    const note = await client.entry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        pinnedBy: {
          where: { userId },
          select: { id: true }
        },
        bookmarks: {
          where: { userId },
          select: { id: true }
        }
      }
    });

    if (!note || note.isDeleted)
      return res.status(404).json({ message: "Note not found" });

    // Format response
    const formattedNote = {
      id: note.id,
      entryTitle: note.entryTitle,
      synopsis: note.synopsis,
      content: note.content,
      userId: note.userId,
      authorFirstName: note.user.firstName,
      authorLastName: note.user.lastName,
      createdAt: note.createdAt,
      updatedAt: note.lastUpdated,
      pinned: note.pinnedBy.length > 0,
      bookmarked: note.bookmarks.length > 0
    };

    res.status(200).json(formattedNote);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// UPDATE NOTE
export const updateNote = async (req: Request, res: Response) => {
  try {
    const id = ensureId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid note ID" });

    const { entryTitle, synopsis, content } = req.body;

    const existing = await client.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id || existing.isDeleted) {
      return res.status(404).json({ message: "Note not found" });
    }

    const updatedNote = await client.entry.update({
      where: { id },
      data: {
        entryTitle: entryTitle ?? existing.entryTitle,
        synopsis: synopsis ?? existing.synopsis,
        content: content ?? existing.content,
      },
    });

    res.status(200).json({ message: "Note updated successfully", note: updatedNote });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// SOFT DELETE NOTE → moves to trash
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const id = ensureId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid note ID" });

    const note = await client.entry.findUnique({ where: { id } });
    if (!note || note.userId !== req.user.id || note.isDeleted) {
      return res.status(404).json({ message: "Note not found" });
    }

    await client.entry.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: "Note moved to trash" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET TRASH
export const trash = async (req: Request, res: Response) => {
  try {
    const notes = await client.entry.findMany({
      where: { userId: req.user.id, isDeleted: true },
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// RECOVER NOTE
export const recoverDeletedNote = async (req: Request, res: Response) => {
  try {
    const id = ensureId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid note ID" });

    const note = await client.entry.findUnique({ where: { id } });
    if (!note || note.userId !== req.user.id || !note.isDeleted) {
      return res.status(404).json({ message: "Note not found" });
    }

    await client.entry.update({
      where: { id },
      data: { isDeleted: false },
    });

    res.status(200).json({ message: "Note recovered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PERMANENT DELETE NOTE → only if already in trash
export const deleteNotePermanently = async (req: Request, res: Response) => {
  try {
    const id = ensureId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid note ID" });

    const note = await client.entry.findUnique({ where: { id } });
    if (!note || note.userId !== req.user.id || !note.isDeleted) {
      return res.status(404).json({ message: "Note not found in trash" });
    }

    await client.entry.delete({ where: { id } });
    res.status(200).json({ message: "Note permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// TOGGLE PIN FOR NOTE
export const togglePin = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const id = ensureId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid note ID" });

    // Check if note exists and belongs to user
    const note = await client.entry.findFirst({
      where: {
        id,
        userId,
        isDeleted: false
      }
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if already pinned
    const existingPin = await client.pinnedEntry.findFirst({
      where: {
        userId,
        entryId: id
      }
    });

    if (existingPin) {
      // Unpin
      await client.pinnedEntry.delete({
        where: { id: existingPin.id }
      });
      return res.json({ 
        message: 'Note unpinned successfully', 
        pinned: false 
      });
    } else {
      // Pin
      await client.pinnedEntry.create({
        data: {
          userId,
          entryId: id
        }
      });
      return res.json({ 
        message: 'Note pinned successfully', 
        pinned: true 
      });
    }
  } catch (error) {
    console.error("Error toggling pin:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// TOGGLE BOOKMARK FOR NOTE
export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const id = ensureId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid note ID" });

    // Check if note exists (user can bookmark any note, not just their own)
    const note = await client.entry.findFirst({
      where: {
        id,
        isDeleted: false
      }
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if already bookmarked
    const existingBookmark = await client.bookmark.findFirst({
      where: {
        userId,
        entryId: id
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await client.bookmark.delete({
        where: { id: existingBookmark.id }
      });
      return res.json({ 
        message: 'Bookmark removed successfully', 
        bookmarked: false 
      });
    } else {
      // Add bookmark
      await client.bookmark.create({
        data: {
          userId,
          entryId: id
        }
      });
      return res.json({ 
        message: 'Note bookmarked successfully', 
        bookmarked: true 
      });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET USER'S BOOKMARKED NOTES
export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const bookmarks = await client.bookmark.findMany({
      where: { userId },
      include: {
        entry: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            pinnedBy: {
              where: { userId },
              select: { id: true }
            },
            bookmarks: {
              where: { userId },
              select: { id: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response
    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.entry.id,
      entryTitle: bookmark.entry.entryTitle,
      synopsis: bookmark.entry.synopsis,
      content: bookmark.entry.content,
      userId: bookmark.entry.userId,
      authorFirstName: bookmark.entry.user.firstName,
      authorLastName: bookmark.entry.user.lastName,
      createdAt: bookmark.entry.createdAt,
      updatedAt: bookmark.entry.lastUpdated,
      pinned: bookmark.entry.pinnedBy.length > 0,
      bookmarked: true // Always true for bookmarks
    }));

    res.status(200).json(formattedBookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET USER'S PINNED NOTES
export const getPinnedNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const pinnedEntries = await client.pinnedEntry.findMany({
      where: { userId },
      include: {
        entry: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            pinnedBy: {
              where: { userId },
              select: { id: true }
            },
            bookmarks: {
              where: { userId },
              select: { id: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response
    const formattedPinned = pinnedEntries.map(pinned => ({
      id: pinned.entry.id,
      entryTitle: pinned.entry.entryTitle,
      synopsis: pinned.entry.synopsis,
      content: pinned.entry.content,
      userId: pinned.entry.userId,
      authorFirstName: pinned.entry.user.firstName,
      authorLastName: pinned.entry.user.lastName,
      createdAt: pinned.entry.createdAt,
      updatedAt: pinned.entry.lastUpdated,
      pinned: true, // Always true for pinned entries
      bookmarked: pinned.entry.bookmarks.length > 0
    }));

    res.status(200).json(formattedPinned);
  } catch (error) {
    console.error("Error fetching pinned notes:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};