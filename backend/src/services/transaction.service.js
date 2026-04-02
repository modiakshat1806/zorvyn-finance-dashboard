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


            ...(user.role === "ADMIN" && userId && { createdBy: Number(userId) }),



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

    const categoryTotals = {};

    transactions.forEach((t) => {
        const amt = Number(t.amount);

        if (t.type === "INCOME") income += amt;
        else expense += amt;

        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = { income: 0, expense: 0 };
        }
        if (t.type === "INCOME") {
            categoryTotals[t.category].income += amt;
        } else {
            categoryTotals[t.category].expense += amt;
        }
    });

    return {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        categoryTotals
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

export const updateTransactionService = async (id, data) => {
    return await prisma.transaction.update({
        where: { id: Number(id) },
        data: {
            ...data,
            ...(data.date && { date: new Date(data.date) })
        }
    });
};