import { Request, Response } from "express";
import Product, { IProduct } from "../models/Product";
import { AuthRequest } from "../middleware/authmiddleware";

/**
 * @route POST /api/product
 * @desc Create a new product
 * @access Private
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {  productName, price, stock, imageUrl, productUrl, category, source, sourceImage, productImage } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const newProduct: IProduct = new Product({
      productName,
      price,
      stock,
      imageUrl,
      productUrl,
      category,
      source,
      sourceImage,
      productImage,
      userId: req.user.id, // Assign userId from token
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const products = await Product.find({ userId: req.user.id });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const deleteProduct = (async (req: AuthRequest, res: Response):Promise<void> => {
  try {

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return 
    }

    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId, userId: req.user.id });

    if (!product) {
      res.status(404).json({ message: "Product not found or unauthorized to delete" });
      return
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
