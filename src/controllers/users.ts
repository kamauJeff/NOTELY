import { type Request, type Response } from "express";
import {PrismaClient} from '@prisma/client'

const client = new PrismaClient();
// Get the user profile
export const getUserProfile = async(req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const profile = await client.user.findUnique({
            where: {
                id: userId
            },
            select: {
                firstName: true,
                lastName: true,
                username: true,
                emailAddress: true,
                dateJoined: true,
                lastUpdate: true,
                avatar: true
            }
        }) 
        if (!profile) {
            res.status(404).json({message: "Profile not found"})
            return;
        }
        res.status(200).json(profile)       
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
        
    }
}
// updating a user profile
export const updateProfile = async (req: Request, res: Response) =>{
    try {
        const {firstName, lastName, username, emailAddress, avatar} = req.body;
        const userId = req.user.id;
        client.user.update ({
            where: {
                id: userId,
                isDeleted: false
            },
            data: {
                firstName: firstName && lastName,
                lastName: lastName && lastName,
                username: username && username,
                emailAddress: emailAddress && emailAddress,
                avatar: avatar && avatar
            }
        })
        res.status(200).json({message: "Profile updated successfully"})
        
    } catch (error) {
          res.status(500).json({message: "Something went wrong"})

        
    }
}
// deleting a user profile
export const deleteProfile = async(req: Request, res: Response)=> {
    try {
        const userId = req.user.id;
        await client.user.update({
            where: {id: userId},
            data: {isDeleted: true}
        })
        res.status(200).json({message: "Account deleted successfully"})
    } catch (error) {
          res.status(500).json({message: "Something went wrong"})
    }
}
// changing the password