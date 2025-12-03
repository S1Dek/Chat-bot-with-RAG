const prisma = require("./src/prismaClient");
const bcrypt = require("bcrypt");

async function main() {
  const users = [
    { email: "demo@mail.com", password: "", name: "Demo", role: "user" },
    {
      email: "luki83pmi@gmail.com",
      password: "zaq1@WSX",
      name: "Admin1",
      role: "admin",
    },
    {
      email: "marcinratajczak1911@gmail.com",
      password: "zaq1@WSX",
      name: "Admin2",
      role: "admin",
    },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashed, name: u.name, role: u.role },
      create: {
        email: u.email,
        password: hashed,
        name: u.name,
        role: u.role,
      },
    });

    console.log("✔ User saved:", u.email);
  }

  process.exit(0);
}

main().catch((err) => console.error(err));
