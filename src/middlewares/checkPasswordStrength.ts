import { type Request, type Response, type NextFunction } from "express";
import  zxcvbn  from "zxcvbn";

export function checkPasswordStrength(req:Request, res: Response, next: NextFunction) {
    const {password} = req.body
    const result =zxcvbn (password);
    if (result.score<3) {
        res.status(400).json({message: "Please use a stronger Password"})
        return;
    }
    next();
}