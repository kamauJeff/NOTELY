import { type Request, type Response } from "express";
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken";




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

export const login = async function (req:Request, res:Response) {
  try {
    // get the identifier and password
    const {identifier, password} = req.body
    // get the user whose username or email match the identifier
    const user= await client.user.findFirst({
      where: {
        OR: [{ emailAddress: identifier}, {username: identifier}]
      }
    })
    // if user not found, we have wrong login credentials
    if (!user) {
      res.status(400).json({message: "Wrong Login Credentials"})
        return;
    } 
    
    // if user found, compare the user password with the given password
     const passwordsMatch=  await bcrypt.compare(password, user.password)
    // if passwords don't match - wrong credentials
    if (!passwordsMatch) {
      res.status(400).json({message: "Wrong Login credentials"})
      return;
      
    }
    // if they match - login success - prepare payload
     const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddress: user.emailAddress,
      avatar: user.avatar,

     }
    // generate a token and send it to the client as acookie
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {expiresIn: `21d`});
    res.status(200).cookie("authToken", token).json(payload)
  } catch (error) {
    res.status(500).json({message: "Something went wrong"})
    console.log(error);
    
  }
  
}

export const logout = function (req:Request, res: Response) {
  try {
    res.status(200).clearCookie("authToken").json({message: "Successfully logged out"})
    
  } catch (error) {
    res.status(500).json({message: "Something went wrong"})
    console.log(error);
    
  }
  
}
