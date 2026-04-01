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

export const getTransactionsService = async (userId, query) => {
    const { type, category, startDate, endDate } = query;

    return await prisma.transaction.findMany({
        where: {
            createdBy: userId,
            isDeleted: false,
            ...(type && { type }),
            ...(category && { category }),
            ...(startDate && endDate && {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            }),
        },
        orderBy: { date: "desc" },
    });
};


export const getSummaryService = async (userId) => {
    const transactions = await prisma.transaction.findMany({
        where: {
            createdBy: userId,
            isDeleted: false
        }
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
        if (t.type === "INCOME") {
            income += Number(t.amount);
        } else {
            expense += Number(t.amount);
        }
    });

    return {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
    };
};