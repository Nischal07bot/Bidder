import fastify from "fastify";
import { config } from "dotenv";
import { prisma } from "../db/prisma.js";
config();
const fastifyIns=fastify({ logger: true });
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

fastifyIns.get("/health", async (request, reply) => {
  try{
     const result = await prisma.$queryRaw<unknown[]>`SELECT 1`;

    return reply.status(200).send({
      status: "ok",
      database: result[0] ? "connected" : "unknown",
    });
  }catch(err)
  {
    fastifyIns.log.error(err);
    return reply.status(500).send({
      status: "error",
      message: "Database connection failed",
    });
  }
}
)
fastifyIns.listen({ port:port, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastifyIns.log.error(err)
    process.exit(1)
  }
  fastifyIns.log.info(`server listening on ${address}`)
})