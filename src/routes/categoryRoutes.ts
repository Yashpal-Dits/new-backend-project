import { Router } from "express";
import * as categoryController from "../controllers/CategoryController";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate } from "../middlewares/authMiddleware";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/categoryValidation";

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new product category (Authenticated users only)
 *     tags:
 *       - Categories
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Electronic devices and gadgets"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error or category already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  validateRequest(createCategorySchema),
  categoryController.createCategory
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve all product categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Category ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories/name/{name}:
 *   get:
 *     summary: Get category by name
 *     description: Retrieve a specific category by its name
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *         example: "Electronics"
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get("/name/:name", categoryController.getCategoryByName);

/**
 * @swagger
 * /api/categories/{id}/exists:
 *   get:
 *     summary: Check if category exists
 *     description: Check if a category exists by its ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Category ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Category existence check completed
 *       500:
 *         description: Internal server error
 */
router.get("/:id/exists", categoryController.checkCategoryExists);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Update a product category (Authenticated users only)
 *     tags:
 *       - Categories
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Category ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "Electronics Updated"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Updated electronics description"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticate,
  validateRequest(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Delete a product category (Authenticated users only). Cannot delete if it has products.
 *     tags:
 *       - Categories
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Category ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with products
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, categoryController.deleteCategory);

export default router;