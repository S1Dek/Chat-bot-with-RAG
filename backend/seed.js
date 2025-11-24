const prisma = require("./src/prismaClient");
const bcrypt = require("bcrypt");

async function main() {
    const password = await bcrypt.hash("", 10);
    try {
        const u = await prisma.user.create({
            data: { email: "demo@mail.com", password, name: "Demo" },
        });
        console.log("Utworzono demo user:", u.email);
    } catch (e) {
        console.log("Nie utworzono (może już istnieje):", e.message);
    }
    process.exit(0);
}

main();