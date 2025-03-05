import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes"
dotenv.config();
const PORT=5000
const app=express()

app.use(cors());
app.use(express.json());

app.use('/api',userRoutes)

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Failed ", error);
    }
};




connectDB().then(() => {
    app.get('/', (req: Request, res: Response) => {
        res.send("Hello World");
    });

    app.listen(PORT, () => {
        console.log(`Server Running on PORT ${PORT}`);
    });
});
