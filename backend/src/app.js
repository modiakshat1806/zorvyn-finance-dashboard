import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

console.log("APP FILE LOADED");
console.log("USER ROUTES IMPORTED");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("API running...");
});

app.use("/api/users", userRoutes);

app.use("/api/transactions", transactionRoutes);

export default app;