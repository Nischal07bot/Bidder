import { prisma } from "./db/prisma.js";
import fastify from "fastify";
import { userRoutes } from "./src/routes/users.js";
export const app=fastify({ logger: true });
app.register(userRoutes,{prefix:"/users"});//yahan p jp bhi apis hmlog userRoutes me define krenge wo /users ke prefix k sath hi call honge
app.get("/health",async (request,reply)=>{
    try{
    const result = await prisma.$queryRaw<unknown[]>`SELECT 1`;
//imp point here is this 
/*// Prisma's actual type definition
$queryRaw<T = unknown>(query: TemplateStringsArray): PrismaPromise<T>; */
//above is the real reason why we are using <unknown[]> here because the return type of $queryRaw 
// is PrismaPromise<T> and we are passing T as unknown[] so the return type of result 
// will be unknown[] and we can use result.rows[0] to check if the database is connected or not
    return reply.status(200).send({
        status:"ok",
        database: result[0] ? "connected" : "unknown"
    })
}
catch(err)
{
    app.log.error(err);
    return reply.status(500).send({
        status:"error",
        message:"Database connection failed"
    })
}})