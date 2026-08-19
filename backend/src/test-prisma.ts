import { prisma } from "./config/prisma.js";

async function testPrisma() {
  try {
    const users = await prisma.user.findMany();

    console.log("✅ Prisma connected successfully");
    console.log(`Users found: ${users.length}`);
  } catch (error) {
    console.error("❌ Prisma connection failed");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
