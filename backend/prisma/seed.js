import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("admin123", 10);

    // USERS
    const usersData = [
        { name: "Admin1", email: "admin1@zorvyn.com", role: "ADMIN" },
        { name: "Admin2", email: "admin2@zorvyn.com", role: "ADMIN" },
        { name: "Analyst1", email: "analyst1@zorvyn.com", role: "ANALYST" },
        { name: "Analyst2", email: "analyst2@zorvyn.com", role: "ANALYST" },
        { name: "Viewer1", email: "viewer1@zorvyn.com", role: "VIEWER" },
    ];

    const users = [];

    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                name: u.name,
                email: u.email,
                passwordHash,
                role: u.role,
            },
        });
        users.push(user);
    }

    console.log("Users seeded");

    //TRANSACTIONS DATA (VARIED)
    const categories = ["Food", "Salary", "Transport", "Rent", "Shopping"];
    const types = ["INCOME", "EXPENSE"];

    const sampleTransactions = [];

    for (let i = 0; i < 20; i++) {
        sampleTransactions.push({
            amount: Math.floor(Math.random() * 5000) + 100,
            type: types[Math.floor(Math.random() * types.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            notes: "Seeded transaction",
            date: new Date(2026, 3, Math.floor(Math.random() * 28) + 1),
        });
    }

    //  ASSIGN TRANSACTIONS TO MULTIPLE USERS
    for (const user of users) {
        if (user.role === "ADMIN" || user.role === "ANALYST") {
            for (const tx of sampleTransactions) {
                await prisma.transaction.create({
                    data: {
                        ...tx,
                        createdBy: user.id,
                    },
                });
            }
        }
    }

    console.log("Transactions seeded for multiple users");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });