import app from "../src/app/app.js";
import connectDB from "../src/config/db.js";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return res.status(503).json({ message: "Service temporarily unavailable" });
  }
}
