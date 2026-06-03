import { Router } from "express";
import * as cartController from "../controllers/CartController";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticate } from "../middlewares/authMiddleware";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validations/cartValidation";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the user's cart (authenticated). If product already exists, quantity is increased.
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error or product issue
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
router.post("/", validateRequest(addToCartSchema), cartController.addToCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the authenticated user's active cart with all items
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", cartController.getCart);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific item in the cart
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.put("/items/:itemId", validateRequest(updateCartItemSchema), cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the cart
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete("/items/:itemId", cartController.removeCartItem);
/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Remove all items from the active cart
 *     description: Deletes all products currently in the authenticated user's active cart.
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - Valid JWT token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/clear", authenticate, cartController.clearCart);


export default router;