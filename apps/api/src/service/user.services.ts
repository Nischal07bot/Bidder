import { prisma } from "../../../api/db/prisma.js";

export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: {
      email,
    },
  });
}