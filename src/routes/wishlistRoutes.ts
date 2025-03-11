import { Router } from "express";
import { verifyToken } from "../middleware/authmiddleware";
import { addToWishlist, deleteWishlist, getAllWishlist } from "../controllers/wishlistControllers";

const router = Router();

router.post("/add", verifyToken, addToWishlist); // Add to wishlist
router.get("/getAll", verifyToken, getAllWishlist); // Get all wishlist items
router.delete("/delete/:id", verifyToken, deleteWishlist); // delete a single wishlist

export default router;
