import mongoose from "mongoose";
import { config } from "./env.config.js";

let connectionPromise;

mongoose.connection.on("disconnected", () => {
  connectionPromise = undefined;
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.MONGO_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose;
};

export default connectDB;
