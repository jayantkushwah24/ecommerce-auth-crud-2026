import mongoose from "mongoose";
import { config } from "./env.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("mongodb connected")
  } catch (error) {
    console.log("error in connecting to db: ", error);
  }
};

export default connectDB;
