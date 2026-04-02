import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Passwords
    const passwords = {
        ADMIN: await bcrypt.hash("admin123", 10),
        ANALYST: await bcrypt.hash("analyst123", 10),
        VIEWER: await bcrypt.hash("viewer123", 10),
    };


    const usersData = [
        {
            name: "Admin User",
            email: "admin@zorvyn.com",
            role: "ADMIN",
            passwordHash: passwords.ADMIN,
        },
        {
            name: "Analyst User",
            email: "analyst@zorvyn.com",
            role: "ANALYST",
            passwordHash: passwords.ANALYST,
        },
        {
            name: "Viewer User",
            email: "viewer@zorvyn.com",
            role: "VIEWER",
            passwordHash: passwords.VIEWER,
        },
    ];

    const users = [];

    // UPSERT USERS (no duplicates)
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                passwordHash: u.passwordHash,
                role: u.role,
                name: u.name,
            },
            create: u,
        });

        users.push(user);
    }

    console.log("Users seeded");

    // Prevent duplicate transactions
    const existingCount = await prisma.transaction.count();

    if (existingCount > 0) {
        console.log("Transactions already exist. Skipping...");
        return;
    }

    // Sample Transactions
    const categories = ["Food", "Salary", "Transport", "Rent", "Shopping"];
    const types = ["INCOME", "EXPENSE"];

    for (const user of users) {
        // Only ADMIN & ANALYST can have transactions
        if (user.role === "ADMIN" || user.role === "ANALYST") {
            for (let i = 0; i < 10; i++) {
                await prisma.transaction.create({
                    data: {
                        amount: Math.floor(Math.random() * 5000) + 100,
                        type: types[Math.floor(Math.random() * types.length)],
                        category: categories[Math.floor(Math.random() * categories.length)],
                        notes: "Seeded transaction",
                        date: new Date(2026, 3, Math.floor(Math.random() * 28) + 1),
                        createdBy: user.id,
                    },
                });
            }
        }
    }

    console.log("Transactions seeded");
}

main()
    .catch((e) => {
        console.error("Error in seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });