import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "../config/env.config.js";
import authRoutes from "../routes/auth.routes.js";
import productRoutes from "../routes/product.routes.js";

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      const isLocalDevelopmentOrigin =
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1):5173$/.test(origin || "");

      if (
        !origin ||
        isLocalDevelopmentOrigin ||
        config.CLIENT_ORIGINS.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: error.message });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
