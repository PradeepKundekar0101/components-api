import { Request, Response } from "express";
import Wishlist, { IWishlist } from "../models/Wishlist";
import { AuthRequest } from "../middleware/authmiddleware";

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectID, productName, price, stock, imageUrl, productUrl, category, source, sourceImage } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if this product is already in the user's wishlist (by objectID)
    const existingItem = await Wishlist.findOne({ userId: req.user.id, objectID });
    
    if (existingItem) {
      res.status(200).json({ message: "Item already in wishlist", mongodbID: existingItem._id });
      return;
    }

    const newWishlist: IWishlist = new Wishlist({
      objectID, 
      productName,
      price,
      stock,
      imageUrl,
      productUrl,
      category,
      source,
      sourceImage,
      userId: req.user.id, 
    });

    await newWishlist.save();
    res.status(201).json({ message: "Item added successfully", mongodbID: newWishlist._id });
  } catch (error) {
    console.error("Error adding Item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const wishlist = await Wishlist.find({ userId: req.user.id });

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching Items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const wishlistId = req.params.id;

    const item = await Wishlist.findOne({ _id: wishlistId, userId: req.user.id });

    if (!item) {
      res.status(404).json({ message: "Item not found or unauthorized to delete" });
      return;
    }

    await Wishlist.findByIdAndDelete(wishlistId);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting Item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};