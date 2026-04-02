import prisma from "../config/db.js";


export const createTransactionService = async (userId, data) => {
    const { amount, type, category, date, notes } = data;

    return await prisma.transaction.create({
        data: {
            amount,
            type,
            category,
            date: new Date(date),
            notes,
            createdBy: userId
        }
    });
};


export const deleteTransactionService = async (id) => {
    return await prisma.transaction.update({
        where: { id: Number(id) },
        data: { isDeleted: true }
    });
};


export const getTransactionsService = async (user, query) => {
    const { type, category, startDate, endDate, userId } = query;

    return await prisma.transaction.findMany({
        where: {
            isDeleted: false,

            // Admin can filter by any user
            ...(user.role === "ADMIN" && userId && { createdBy: Number(userId) }),

            // Non-admin only sees own
            ...(user.role !== "ADMIN" && { createdBy: user.userId }),

            ...(type && { type }),
            ...(category && { category }),
            ...(startDate && endDate && {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            }),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            }
        },
        orderBy: { date: "desc" },
    });
};

export const getSummaryService = async (user, query) => {
    const { startDate, endDate } = query;

    const transactions = await prisma.transaction.findMany({
        where: {
            isDeleted: false,

            ...(user.role !== "ADMIN" && { createdBy: user.userId }),

            ...(startDate && endDate && {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            }),
        }
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
        if (t.type === "INCOME") income += Number(t.amount);
        else expense += Number(t.amount);
    });

    return {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
    };
};

export const getTransactionByIdService = async (id) => {
    return await prisma.transaction.findUnique({
        where: { id: Number(id) },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    role: true
                }
            }
        }
    });
};