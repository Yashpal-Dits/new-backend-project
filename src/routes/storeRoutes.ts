import { Router } from "express";
import * as storeController from "../controllers/StoreController";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate } from "../middlewares/authMiddleware";
import { createStoreSchema, updateStoreSchema } from "../validations/storeValidation";

const router = Router();

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Create a new store
 *     description: Create a new store (Authenticated users only)
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStoreRequest'
 *     responses:
 *       201:
 *         description: Store created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreResponse'
 *       400:
 *         description: Validation error or store already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  authenticate,
  validateRequest(createStoreSchema),
  storeController.createStore
);

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all stores
 *     description: Retrieve all stores
 *     tags:
 *       - Stores
 *     responses:
 *       200:
 *         description: Stores fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresListResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", storeController.getAllStores);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Get store by ID
 *     description: Retrieve a specific store by its ID
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Store fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreResponse'
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", storeController.getStoreById);

/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     summary: Update store
 *     description: Update a store (Authenticated users only)
 *     tags:
 *       - Stores
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
 *             $ref: '#/components/schemas/UpdateStoreRequest'
 *     responses:
 *       200:
 *         description: Store updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreResponse'
 *       400:
 *         description: Validation error or request error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:id",
  authenticate,
  validateRequest(updateStoreSchema),
  storeController.updateStore
);

/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     summary: Delete store
 *     description: Delete a store (Authenticated users only)
 *     tags:
 *       - Stores
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
 *         description: Store deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Request error or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Store not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authenticate, storeController.deleteStore);

export default router;
