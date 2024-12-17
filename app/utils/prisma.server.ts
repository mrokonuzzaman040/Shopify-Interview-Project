import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// Ensure Prisma is only initialized once
declare global {
  var __prisma: PrismaClient | undefined;
}

if (typeof window === "undefined") {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
} else {
  throw new Error("Prisma should not be used in the browser!");
}

export { prisma };
