import { Router } from "express";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import productRoutes from "./productRoutes";
import storeRoutes from "./storeRoutes";
import cartRoutes from "./cartRoutes";
import addressRoutes from "../routes/addressRoutes";
import orderRoutes from "../routes/orderRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/stores", storeRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", addressRoutes);
router.use("/orders", orderRoutes);

export default router;

