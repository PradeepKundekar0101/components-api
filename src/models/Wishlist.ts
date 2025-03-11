import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  Name: string;
  price: string;
  stock: string;
  imageUrl?: string;
  Url: string;
  category: string;
  source: string;
  sourceImage: string;
  Image?: string;
  userId: mongoose.Types.ObjectId; // Stores the user ID
}

const WishlistSchema = new Schema<IWishlist>({
  Name: { type: String, required: true },
  price: { type: String, required: true },
  stock: { type: String, required: true },
  imageUrl: { type: String },
  Url: { type: String, required: true },
  category: { type: String, required: true },
  source: { type: String, required: true },
  sourceImage: { type: String, required: true },
  Image: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // References User model
});

const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
export default Wishlist;
