import fastify from "fastify";
import { config } from "dotenv";
config();
const fastifyIns=fastify({ logger: true });
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
fastifyIns.get("/health", async (request, reply) => {
  reply.code(200).send({status: "ok"});
}
)
fastifyIns.listen({ port:port, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastifyIns.log.error(err)
    process.exit(1)
  }
  fastifyIns.log.info(`server listening on ${address}`)
})