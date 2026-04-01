import {
    createTransactionService,
    getTransactionsService,
    deleteTransactionService,
    getSummaryService
} from "../services/transaction.service.js";

export const createTransaction = async (req, res) => {
    try {
        const transaction = await createTransactionService(req.user.userId, req.body);
        res.status(201).json(transaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        await deleteTransactionService(req.params.id);
        res.json({ message: "Transaction deleted (soft)" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const data = await getTransactionsService(req.user.userId, req.query);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getSummary = async (req, res) => {
    try {
        const data = await getSummaryService(req.user.userId);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};