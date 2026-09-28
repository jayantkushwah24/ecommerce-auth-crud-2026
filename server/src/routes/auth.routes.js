import express from "express";
import { registerValidation } from "../validators/auth.validator.js";
import {
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controllers.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const router = express.Router();

/**
 * @method POST
 * @endpoint  /api/auth/register
 * @access Public
 * @description Create a new user account
 */
router.post("/register", registerValidation, register);

/**
 * @method POST
 * @endpoint /api/auth/login
 * @access Public
 * @description Authenticate user, issue access + refresh tokens
 */
router.post("/login", login);

/**
 * @method POST
 * @endpoint /api/auth/refresh-token
 * @access Public
 * @description Issue a new access token
 */
router.post("/refresh-token", refresh);

/**
 * @method POST
 * @endpoint /api/auth/logout
 * @access Authenticated
 * @description Invalidate the refresh token
 */
router.post("/logout", authenticate, logout);

/**
 * @method GET
 * @endpoint /api/auth/me
 * @access Authenticated
 * @description Return the logged-in user's profile
 */
router.get("/me", authenticate, me);

export default router;
