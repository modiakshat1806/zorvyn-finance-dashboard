import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
console.log("USER ROUTES LOADED");
const router = express.Router();

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