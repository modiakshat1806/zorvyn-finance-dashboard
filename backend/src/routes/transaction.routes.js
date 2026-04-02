import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
    createTransaction,
    getTransactions,
    deleteTransaction,
    getSummary,
    getTransactionById,
    updateTransaction
} from "../controllers/transaction.controller.js";

const router = express.Router();

// Create (ADMIN)
router.post("/", authenticate, authorize("ADMIN"), createTransaction);

// Get all (ALL users)
router.get("/", authenticate, getTransactions);

router.get("/summary", authenticate, getSummary);

// Delete (ADMIN only)
router.delete("/:id", authenticate, authorize("ADMIN"), deleteTransaction);

router.get("/:id", authenticate, getTransactionById);

// UPDATE → ADMIN only (NEW FEATURE)
router.put("/:id", authenticate, authorize("ADMIN"), updateTransaction);

export default router;