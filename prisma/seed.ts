import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("user123", 10);
  const userOneData = {
    name: "User One",
    username: "userone123",
    email: "userone@example.com",
    passwordHash: hashedPassword,
  };

  const userOne = await prisma.user.upsert({
    where: {
      email: userOneData.email,
    },
    update: {
      name: userOneData.name,
      username: userOneData.username,
      passwordHash: userOneData.passwordHash,
    },
    create: userOneData,
  });

  console.log("Seeded user one account:", userOne.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
