import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import prisma from "../config/db.js";

const router = express.Router();

// List all users — ADMIN only (used by frontend User filter)
router.get("/", authenticate, authorize("ADMIN"), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true },
            orderBy: { name: "asc" },
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only
router.get("/admin", authenticate, authorize("ADMIN"), (req, res) => {
    res.json({ message: "Admin access granted" });
});

// Analyst + Admin
router.get("/analytics", authenticate, authorize("ADMIN", "ANALYST"), (req, res) => {
    res.json({ message: "Analytics data" });
});

// All logged users
router.get("/profile", authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;