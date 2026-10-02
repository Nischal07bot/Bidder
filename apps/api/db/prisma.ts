import { PrismaPg } from "@prisma/adapter-pg";
import { databaseConfig } from "../config/dbconfig.js";
import { pool } from "./pool.js";
import { PrismaClient } from "@prisma/client";
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
//reusing the same connection pool for prisma as well so that we dont have to create a new connection pool for prisma a
// nd we can reuse the same connection pool for both pg and prisma
/*
prisma CLI: introspects the database and creates schema.prisma
@prisma/client: handles the object/type/query translation
@prisma/adapter-pg: adapts Prisma to the PostgreSQL driver interface
pg: sends low-level commands to PostgreSQL
*/