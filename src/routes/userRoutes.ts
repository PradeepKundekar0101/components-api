import express from "express";
import { deleteUser } from "../controllers/userController";
const router = express.Router();

/**
 * @swagger
 * /api/v1/user/user/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/user/:userId", deleteUser);

export default router;
