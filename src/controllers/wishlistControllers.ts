import { Request, Response } from "express";
import Wishlist, { IWishlist } from "../models/Wishlist";
import { AuthRequest } from "../middleware/authmiddleware";
import client from "../lib/algolia";

export const addToWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      objectID,
      productName,
      price,
      stock,
      imageUrl,
      productUrl,
      category,
      source,
      sourceImage,
    } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate objectID
    if (!objectID || typeof objectID !== "string") {
      res.status(400).json({ message: "Invalid objectID" });
      return;
    }

    // Check if this product is already in the user's wishlist (by objectID)
    const existingItem = await Wishlist.findOne({
      userId: req.user.id,
      objectID,
    });

    if (existingItem) {
      res.status(200).json({
        message: "Item already in wishlist",
        mongodbID: existingItem._id,
      });
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

    try {
      // Get product with error handling
      const product = await client.getObject(objectID);

      // Update weight safely
      const currentWeight = (product as any).weight || 0;
      const newWeight = currentWeight + 1;

      await client.partialUpdateObject({
        objectID,
        weight: newWeight,
      });

      await newWishlist.save();
      res.status(201).json({
        message: "Item added successfully",
        mongodbID: newWishlist._id,
      });
    } catch (algoliaError) {
      console.error("Algolia Error:", algoliaError);

      // If Algolia fails but we still want to save the item to wishlist
      await newWishlist.save();
      res.status(201).json({
        message: "Item added to wishlist but failed to update product weight",
        mongodbID: newWishlist._id,
      });
    }
  } catch (error) {
    console.error("Error adding Item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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

export const deleteWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const wishlistId = req.params.id;

    const item = await Wishlist.findOne({
      _id: wishlistId,
      userId: req.user.id,
    });

    if (!item) {
      res
        .status(404)
        .json({ message: "Item not found or unauthorized to delete" });
      return;
    }

    await Wishlist.findByIdAndDelete(wishlistId);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting Item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
