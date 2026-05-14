import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/dataSource";



dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: " Server is running",
    
  });
});



const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log(" Database Connected");

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    
    });
  } catch (error) {
    console.error(" Server startup failed:", error);
    process.exit(1);
  }
};

startServer();