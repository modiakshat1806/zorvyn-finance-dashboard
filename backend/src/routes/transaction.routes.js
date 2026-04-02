import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
    createTransaction,
    getTransactions,
    deleteTransaction,
    getSummary,
    getTransactionById
} from "../controllers/transaction.controller.js";

const router = express.Router();

// Create (ANALYST + ADMIN)
router.post("/", authenticate, authorize("ADMIN", "ANALYST"), createTransaction);

// Get all (ALL users)
router.get("/", authenticate, getTransactions);

router.get("/summary", authenticate, getSummary);

// Delete (ADMIN only)
router.delete("/:id", authenticate, authorize("ADMIN"), deleteTransaction);

router.get("/:id", authenticate, getTransactionById);

export default router;