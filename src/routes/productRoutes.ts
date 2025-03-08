import { Router } from "express";
import { verifyToken } from "../middleware/authmiddleware";
import { createProduct, deleteProduct, getAllProducts } from "../controllers/productControllers";

const router = Router();

router.post("/create", verifyToken, createProduct); // Create product
router.get("/getproducts", verifyToken, getAllProducts); // Get all products of a user
router.delete("/delete/:id", verifyToken, deleteProduct); // delete a single product

export default router;
