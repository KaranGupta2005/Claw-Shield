import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URL ||
      "mongodb+srv://guptakaranport:karang2006@cluster0.gapyepy.mongodb.net/",
  );
};

connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

export default connectDB;

