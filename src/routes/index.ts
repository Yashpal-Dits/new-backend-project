import { Router } from "express";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import productRoutes from "./productRoutes";
import storeRoutes from "./storeRoutes";
import cartRoutes from "./cartRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/stores", storeRoutes);
router.use("/cart", cartRoutes);

export default router;

