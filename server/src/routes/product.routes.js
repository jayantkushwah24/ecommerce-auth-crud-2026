import express from "express";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import multer from "multer";
import {
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  updateProductById,
} from "../controllers/product.controllers.js";
import { createProductValidator } from "../validators/products.validator.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

/**
 * @method POST
 * @endpoint /api/products
 * @access Authenticated
 * @description Create a new product
 */
router.post(
  "/",
  authenticate,
  upload.array("images", 5),
  createProductValidator,
  createProduct,
);

/**
 * @method GET
 * @endpoint /api/products
 * @access Public
 * @description List all products
 */
router.get("/", getAllProducts);

/**
 * @method GET
 * @endpoint /api/products/:id
 * @access Public
 * @description Get a single product by ID
 */
router.get("/:id", getProductById);

/**
 * @method PUT
 * @endpoint /api/products/:id
 * @access Authenticated
 * @description Update a product
 */
router.put("/:id", authenticate, updateProductById);

/**
 * @method DELETE
 * @endpoint /api/products/:id
 * @access Authenticated
 * @description Delete a product
 */
router.delete("/:id", authenticate, deleteProductById);

export default router;
