import * as express from 'express'

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    emailAddress: string;
    avatar: string;
}

declare global {
    namespace Express{
        interface Request {
            user: User
        }
    }
}