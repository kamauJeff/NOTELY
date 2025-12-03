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


export const getNotes = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const notes = await client.entry.findMany({
            where: {
                AND: [{userId: userId}, {isDeleted: false}]
            }
        })
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({message: "Something went wrong"
        })
        
    }
}

export const getNote = async (req: Request, res: Response) => {
    try {
    const {id} = req.params;
    const userId = req.user.id;
   const note = await client.entry.findFirst({
        where: {
            AND: [{id: String (id)}, {userId}, {isDeleted: false}]
        }
    }) 
    if (!note) {
        res.status(404).json({message: "Note not found"});
        return;
        
    }
    res.status(200).json(note);       
    } catch (error) {
        res.status(500).json({message: "Something went wrong"
        })
        
    }
}


export const deleteNote = async(req: Request, res: Response) => {
    try {
    const {id} = req.params;
    const userId = req.user.id;
    
    await client.entry.updateMany({
        where: {
            AND: [{id: String(id)}, {userId}]
        },
        data: {
            isDeleted: true
        }
    })
    res.status(200).json({message: "Note deleted successfully"})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"
        })   
    }
}

export const trash = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const notes = await client.entry.findMany({
            where: {
                AND: [{isDeleted: true}, {userId}]
            }
        })
        res.status(200).json(notes)
    } catch (error) {
         res.status(500).json({message: "Something went wrong"
        }) 
        
    }
}

export const recoverDeletedNote = async (req: Request, res: Response) => {
   try {
     const {id} = req.params;
     const userId = req.user.id
 
     await client.entry.updateMany({
         where: {
             AND: [{id: String(id)}, {userId}]
         },
         data: {
             isDeleted: false
         }
     })
     res.status(200).json({message: "Note recovered successfully"})
   } catch (error) {
     res.status(500).json({message: "Something went wrong"
        }) 
    
   }
}

export const updateNote = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const { entryTitle, synopsis, content} = req.body
        const userId = req.user.id;
        await client.entry.updateMany({
            where: {
                AND: [{id: String(id)}, {userId}]
            },
            data: {
                entryTitle: entryTitle && entryTitle,
                synopsis: synopsis && synopsis,
                content: content && content
            }
        })

        res.status(200).json({message: "Note updated successfully"})
        
    } catch (error) {
        res.status(500).json({message: "Something went wrong"
        }) 
        
    }
}