import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  objectID: string;
  productName: string;
  price: string;
  stock: string;
  imageUrl?: string;
  productUrl: string;
  category: string;
  source: string;
  sourceImage: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema(
  {
    objectID: { type: String, required: true, },
    productName: { type: String, required: true, },
    price: { type: String, required: true, },
    stock: { type: String, required: true, },
    imageUrl: { type: String, },
    productUrl: { type: String, required: true,},
    category: { type: String, required: true,},
    source: { type: String, required: true,},
    sourceImage: { type: String, required: true,},
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true},
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ userId: 1, objectID: 1 }, { unique: true });
export default mongoose.model<IWishlist>("Wishlist", wishlistSchema);