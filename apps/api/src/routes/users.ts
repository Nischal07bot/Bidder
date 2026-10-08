import { prisma } from "../../db/prisma.js";
import { app } from "../../app.js";
import { FastifyPluginAsync } from "fastify";
import { registerUser } from "../service/user.services.js";

const createUserSchema={
    type:"object",
    required:["email","username","password"],
    properties:{
        email:{type:"string",format:"email"},
        username:{type:'string',minLength:3,maxLength:20},
        password:{type:'string',minLength:6,maxLength:20}
    }
}

interface CreateUserBody{
    email:string,
    username:string,
    password:string
}


export const userRoutes:FastifyPluginAsync=async (fastify)=>{
    fastify.post<{Body:CreateUserBody}>(
        "/",
        { schema: {body:createUserSchema} },
        async (request,reply)=>{
            try{
            //destructuring the request body to get the email, username and password
            const { email,username,password }= request.body;
            //call the registerUser function in the user->services file to register the user
            const result=await registerUser({username,email,password});
            return reply.status(201).send(result);
            }
            catch(err)
            {
                request.log.error(err);
                return reply.status(500).send({
                    status:"error",
                    message:"Internal server error"
                })
            }
        }
    )
}