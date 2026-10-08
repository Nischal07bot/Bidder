import { prisma } from "../../../api/db/prisma.js";
import { hashPassword } from "../utils/password.js";

//so now here i need to register users as well with a  hashed password 

type registerUserInput = {
    email: string;
    password:string;
    username:string;
}

export  async function registerUser(input: registerUserInput) {
    //now the function calling this function should put an await since here we are returning a promise and we need to wait for the promise to resolve before we can return the result to the caller
    const hashedPassword=await hashPassword(input.password);
    return prisma.users.create({
        data:{
            username:input.username,
            email:input.email,
            password:hashedPassword
        },
        select:{
            id:true,
            email:true,
            username:true,
            created_at:true
        }
    })
}