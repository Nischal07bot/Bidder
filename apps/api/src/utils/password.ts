import { randomBytes,scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const sycrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await sycrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, key] = hashedPassword.split(":");
  const hash = (await sycrypt(password, salt, 64)) as Buffer;//key mera hash hai 
  return key === hash.toString("hex");
}