import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // Optional: Prisma logs for debugging
  });

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;

export default prisma;

// import { PrismaClient } from "@prisma/client";

// const prismaClientSingleton = () => {
//   return new PrismaClient();
// };

// declare const globalThis: {
//   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
// } & typeof global;

// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
// export default prisma;

// if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
