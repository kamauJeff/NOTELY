import { type Request, type Response, type NextFunction } from "express";
import jwt from 'jsonwebtoken'

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    emailAddress: string;
    avatar: string;
}


export function verifyToken(req:Request, res: Response, next: NextFunction) {
    const { authToken} = req.cookies;
    if (!authToken) {
        res.status(401).json({message: "Unauthorized, Please Login"})
        return;
        
    }

    try {
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET_KEY!)
            req.user = decoded as User;
            next();

        
    } catch (error) {
        res.status(500).json({message: "Unauthorized. Please login"})
        
    }    
}