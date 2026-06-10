const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.admin.findUnique({
    where: { email: "admin@shopsastamart.com" },
  });

  if (!existing) {
    const hash = await bcrypt.hash("admin123", 10);
    await prisma.admin.create({
      data: {
        email: "admin@shopsastamart.com",
        password: hash,
        name: "Admin",
        role: "admin",
      },
    });
    console.log("Admin seeded: admin@shopsastamart.com / admin123");
  } else {
    console.log("Admin already exists");
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
