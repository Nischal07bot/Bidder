import fastify from "fastify";

const fastifyIns=fastify({ logger: true });

fastifyIns.get("/health", async (request, reply) => {
  reply.code(200).send({status: "ok"});
}
)
fastifyIns.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastifyIns.log.error(err)
    process.exit(1)
  }
  fastifyIns.log.info(`server listening on ${address}`)
})