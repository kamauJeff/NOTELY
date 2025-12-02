import express, {type Request, type Response, type NextFunction} from 'express';



export function checkDetails(req:Request, res: Response, next: NextFunction) {
  const { firstName, lastName, username, emailAddress, password, avatar} = req.body

  if (!firstName) {
    res.status(400).json({message: "First name is required"})
    return
  }
  if (!lastName) {
    res.status(400).json({message: "Last name is required"})
    return
}
if (!username) {
    res.status(400).json({message: "Username is required"})
    return
}
if (!emailAddress) {
    res.status(400).json({message: "Email Address is required"})
    return
}
if (!password) {
    res.status(400).json({message: "Password is required"})
    return
}
if (!avatar) {
    res.status(400).json({message: "Avatar is required"})
    return
}
    next();
}