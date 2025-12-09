import { type NextFunction, type Request, type Response } from "express";


export function validateNoteDetails(req:Request, res: Response, next: NextFunction) {
    const {entryTitle, synopsis, content} = req.body
    if (!entryTitle) {
        res.status(400).json({message: "Note Title is required"})
        return;
    }
    if (!synopsis) {
        res.status(400).json({message: "Synopsis is required"})
        return;   
    }
    if (!content) {
        res.status(400).json({message: "Content is required"})
        return;
        
    }
    next();
}