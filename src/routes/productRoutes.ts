import { Router } from "express";
import * as productController from "../controllers/ProductController";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate } from "../middlewares/authMiddleware";
import { uploadProductImage } from "../middlewares/upload";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/productValidation";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with optional image upload (Authenticated users only)
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - name
 *               - price
 *               - categories_id
 *             properties:
 *               store_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Wireless Headphones
 *               price:
 *                 type: number
 *                 example: 2999.99
 *               categories_id:
 *                 type: integer
 *                 example: 2
 *               stock:
 *                 type: integer
 *                 example: 50
 *               description:
 *                 type: string
 *                 example: High quality wireless headphones
 *               sku:
 *                 type: string
 *                 example: WH-001
 *               image:
 *                 type: string
 *                 format: binary
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation or request error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authenticate,
  uploadProductImage.single("image"),
  validateRequest(createProductSchema),
  productController.createProduct
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products (with pagination)
 *     description: Retrieve products with simple pagination
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               categories_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation or request error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authenticate,
  uploadProductImage.single("image"),
  validateRequest(updateProductSchema),
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticate, productController.deleteProduct);

export default router;