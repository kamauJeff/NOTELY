import { type Request, type Response } from "express";
import {PrismaClient} from '@prisma/client'

const client = new PrismaClient();


export const createNote = async (req: Request, res: Response) =>{
    try {

        const {entryTitle, synopsis, content }= req.body 
        await client.entry.create ({
            data: {
                entryTitle,
                synopsis,
                content,
                userId: req.user.id
            }
        })
        res.status(201).json({message: "Note created successfully"})    
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
} 