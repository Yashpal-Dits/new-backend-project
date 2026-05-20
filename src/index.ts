import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/dataSource";
import routes from "./routes/index";
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);


app.use("/api", routes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    timestamp: new Date().toISOString(),
  });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(" Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  }
};

start();

export default app;