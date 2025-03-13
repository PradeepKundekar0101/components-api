import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
dotenv.config();
const PORT = 8000;
const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/auth", authRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
  } catch (error) {
    throw error;
  }
};

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.get("/", (req: Request, res: Response) => {
  res.send("Components API"); 
});
app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});
