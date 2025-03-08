import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  price: string;
  stock: string;
  imageUrl?: string;
  productUrl: string;
  category: string;
  source: string;
  sourceImage: string;
  productImage?: string;
  userId: mongoose.Types.ObjectId; // Stores the user ID
}

const ProductSchema = new Schema<IProduct>({
  productName: { type: String, required: true },
  price: { type: String, required: true },
  stock: { type: String, required: true },
  imageUrl: { type: String },
  productUrl: { type: String, required: true },
  category: { type: String, required: true },
  source: { type: String, required: true },
  sourceImage: { type: String, required: true },
  productImage: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // References User model
});

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
