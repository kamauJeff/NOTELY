import express from "express";
import {
  register,
  login,
  logout,
  changePassword
} from "./controllers/auth.ts";
import {
  createNote,
  getNotes,
  getNote,
  deleteNote,
  trash,
  recoverDeletedNote,
  updateNote,
  deleteNotePermanently,
  togglePin,
  toggleBookmark,
  getBookmarks,
  getPinnedNotes
} from "./controllers/Notes.ts";
import { checkDetails } from "./middlewares/checkDetails.ts";
import { checkUsernameAndEmail } from "./middlewares/checkUsernameAndEmail.ts";
import { checkPasswordStrength } from "./middlewares/checkPasswordStrength.ts";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { verifyToken } from "./middlewares/verifyToken.ts";
import { validateNoteDetails } from "./middlewares/validateNoteDetails.ts";
import { getUserProfile, updateProfile, deleteProfile } from "./controllers/users.ts";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

/* -------- Auth -------- */
app.post("/auth/register", checkDetails, checkUsernameAndEmail, checkPasswordStrength, register);
app.post("/auth/login", login);
app.post("/auth/logout", logout);
app.patch("/auth/password", verifyToken, checkPasswordStrength, changePassword);

/* -------- Notes -------- */
app.post("/notes", verifyToken, validateNoteDetails, createNote);
app.get("/notes", verifyToken, getNotes);
app.get("/notes/trash", verifyToken, trash);
app.get("/notes/:id", verifyToken, getNote);

// Update note
app.patch("/notes/:id", verifyToken, updateNote);

// Soft delete (move to trash)
app.put("/notes/:id/trash", verifyToken, deleteNote);

// Recover from trash
app.patch("/notes/recover/:id", verifyToken, recoverDeletedNote);

// Permanent delete
app.delete("/notes/permanent/:id", verifyToken, deleteNotePermanently);

/* -------- Bookmark & Pin -------- */
// Get bookmarks
app.get("/notes/bookmarks", verifyToken, getBookmarks);

// Get pinned notes
app.get("/notes/pinned", verifyToken, getPinnedNotes);

// Toggle bookmark
app.put("/notes/:id/bookmark", verifyToken, toggleBookmark);

// Toggle pin
app.put("/notes/:id/pin", verifyToken, togglePin);

/* -------- Users -------- */
app.get("/users", verifyToken, getUserProfile);
app.patch("/users", verifyToken, updateProfile);
app.delete("/users", verifyToken, deleteProfile);

const PORT = 5200;
app.listen(PORT, () => console.log(`App running at http://localhost:${PORT}`));

export default app;