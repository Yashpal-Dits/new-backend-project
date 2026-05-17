import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/dataSource";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Error Handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("✗ Error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start Server
const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log(" Database connected");
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Server startup failed:", error);
    process.exit(1);
  }
};

start();

export default app;