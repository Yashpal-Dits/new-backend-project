import express from "express";
import path from "path";
import dotenv from "dotenv";
import { AppDataSource } from "./config/dataSource";
import routes from "./routes/index";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import logger from "./config/logger";
import { requestLogger, logError } from "./middlewares/logger";
import { connectRedis } from "./config/redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(requestLogger);

// --- Swagger Documentation ---
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// --- Routes ---
app.use("/api", routes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// --- 404 Handler ---
app.use((req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    timestamp: new Date().toISOString(),
  });
});

// --- Global Error Handler ---
app.use((err: any, req: any, res: any, _next: any) => {
  logError(err, {
    endpoint: req.originalUrl,
    method: req.method,
    body: req.body
  });
  res.status(err.status || 500).json({
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// --- Server Startup ---
const start = async () => {
  try {
  
    await AppDataSource.initialize();
    logger.info("Database connected successfully");

    await connectRedis(); 

    app.listen(PORT, () => {
      logger.info(` Server running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logError(error as Error, { endpoint: "Server Initialization" });
    process.exit(1);
  }
};

start();

export default app;