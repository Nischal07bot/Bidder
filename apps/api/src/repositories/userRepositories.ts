import { prisma } from "../../db/prisma.js";

export type CreateUserdata = {
    email:string,
    username:string,
    password:string,
}
export type UserRecord ={
    email:string,
    username:string,
    id:string,
    created_at:Date,
}

export interface UserRepository {
    createUser(data:CreateUserdata):Promise<UserRecord>;
    findUserByEmail(email:string): Promise<UserRecord | null>;
}

export const userRepository:UserRepository = {
    async createUser(data)
    {
        return prisma.users.create({
            data,
            select:{
                id:true,
                email:true,
                username:true,
                created_at:true
            }
        })
    },
    async findUserByEmail(email)
    {
        return prisma.users.findUnique({
            where:{
                email
            },
            select:{
                id:true,
                email:true,
                username:true,
                created_at:true
            }
        })
    }
}