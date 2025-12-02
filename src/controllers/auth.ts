import { type Request, type Response } from "express";
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client';




const client = new PrismaClient()


export const register = async(req: Request, res: Response) => {
    try {
     const {firstName, lastName, username, emailAddress, password, avatar} = req.body
     const hashedPassword = await bcrypt.hash(password, 11);
      await client.user.create({
        data: {
          firstName,
          lastName,
          username,
          emailAddress,
          password: hashedPassword,
          avatar
        }
      })
      res.status(201).json({message: "Account created successfully"})
        
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
        
    }
    
}