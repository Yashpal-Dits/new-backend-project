import { Router } from "express";
import * as productController from "../controllers/ProductController";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate } from "../middlewares/authMiddleware";
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
 *     description: Create a new product (Authenticated users only)
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post(
  "/",
  authenticate,
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
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put(
  "/:id",
  authenticate,
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
 */
router.delete("/:id", authenticate, productController.deleteProduct);

export default router;