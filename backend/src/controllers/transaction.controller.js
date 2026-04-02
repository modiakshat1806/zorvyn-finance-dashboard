import {
    createTransactionService,
    getTransactionsService,
    deleteTransactionService,
    getSummaryService,
    getTransactionByIdService,
    updateTransactionService
} from "../services/transaction.service.js";

export const createTransaction = async (req, res) => {
    try {
        const transaction = await createTransactionService(req.user.userId, req.body);
        res.status(201).json(transaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const updated = await updateTransactionService(req.params.id, req.body);
        res.json(updated);
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
        const data = await getTransactionsService(req.user, req.query);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getSummary = async (req, res) => {
    try {
        const data = await getSummaryService(req.user, req.query);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getTransactionById = async (req, res) => {
    try {
        const data = await getTransactionByIdService(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};