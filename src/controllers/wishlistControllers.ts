import { Request, Response } from "express";
import Wishlist, { IWishlist } from "../models/Wishlist";
import { AuthRequest } from "../middleware/authmiddleware";

/**
 * @route POST /api/product
 * @desc Create a new product
 * @access Private
 */
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {  Name, price, stock, imageUrl, Url, category, source, sourceImage, Image } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const newWishlist: IWishlist = new Wishlist({
      Name,
      price,
      stock,
      imageUrl,
      Url,
      category,
      source,
      sourceImage,
      Image,
      userId: req.user.id, // Assign userId from token
    });

    await newWishlist.save();
    res.status(201).json({ message: "Item added successfully" });
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



export const deleteWishlist = (async (req: AuthRequest, res: Response):Promise<void> => {
  try {

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return 
    }

    const wishlistId = req.params.id;

    const item = await Wishlist.findOne({ _id: wishlistId, userId: req.user.id });

    if (!item) {
      res.status(404).json({ message: "Item not found or unauthorized to delete" });
      return
    }

    await Wishlist.findByIdAndDelete(wishlistId);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting Item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
