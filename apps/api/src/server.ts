import fastify from "fastify";
import { config } from "dotenv";
import { prisma } from "../db/prisma.js";
import { appendFile } from "node:fs";
import { app } from "../app.js";
config();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen({ port:port, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})