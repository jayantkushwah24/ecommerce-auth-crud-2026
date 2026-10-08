import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!accessToken) {
      return res.status(401).json({
        message: "Access token is missing or malformed",
      });
    }

    const decoded = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    req.userId = decoded.userId;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token has expired",
        code: "TOKEN_EXPIRED", 
      });
    }

    return res.status(401).json({
      message: "Invalid access token",
    });
  }
}
