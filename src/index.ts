import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/dataSource";
import routes from "./routes/index";
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger";
import logger from "./config/logger";
import { requestLogger, logError } from "./middlewares/logger"

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use("/api", routes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    timestamp: new Date().toISOString(),
  });
});

app.use((err: any, req: any, res: any, _next: any) => {
  logError( err, {
    endpoint: req.originalUrl,
    method: req.method,
    body:req.body
  });
  res.status(err.status || 500).json({
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

const start = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected");
    app.listen(PORT, () => {
      logger.info(` Server running on port ${PORT}/api-docs`);
    });
  } catch (error) {
    logError(error as Error, { endpoint: "Databse Initialization" });
    process.exit(1);
  }
};

start();

export default app;