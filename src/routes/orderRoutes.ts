import { Router } from "express";
import * as OrderController from "../controllers/OrderController";
import { authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { checkoutSchema } from "../validations/orderValidation";

const router = Router();

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Checkout cart and create an order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Cart empty or insufficient stock
 */
router.post("/checkout", authenticate, validateRequest(checkoutSchema), OrderController.checkout);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 */
router.get("/", authenticate, OrderController.getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get detailed information about a specific order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details retrieved
 *       404:
 *         description: Order not found
 */
router.get("/:id", authenticate, OrderController.getOrderById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an existing order and restore stock
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 */
router.patch("/:id/cancel", authenticate, OrderController.cancelOrder);

export default router;