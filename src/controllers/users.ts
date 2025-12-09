import { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

/**
 * GET /users
 * Returns user profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const profile = await client.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: {
        firstName: true,
        lastName: true,
        username: true,
        emailAddress: true,
        dateJoined: true,
        lastUpdate: true,
        avatar: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * PATCH /users
 * Updates user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, emailAddress, avatar } = req.body;
    const userId = req.user.id;

    const updatedProfile = await client.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(username && { username }),
        ...(emailAddress && { emailAddress }),
        ...(avatar && { avatar }),
      },
      select: {
        firstName: true,
        lastName: true,
        username: true,
        emailAddress: true,
        dateJoined: true,
        lastUpdate: true,
        avatar: true,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * DELETE /users
 * Soft delete user
 */
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    await client.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
