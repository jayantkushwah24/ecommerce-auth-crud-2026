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
  limits: {
    fileSize: 4 * 1024 * 1024,
    files: 5,
    fieldSize: 64 * 1024,
    fields: 10,
  },
});

const uploadProductImages = (req, res, next) => {
  upload.array("images", 5)(req, res, (error) => {
    if (!error) {
      const totalSize = (req.files || []).reduce(
        (size, file) => size + file.size,
        0,
      );

      if (totalSize > 4 * 1024 * 1024) {
        return res.status(413).json({
          message: "Combined image size cannot exceed 4 MB",
        });
      }

      return next();
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ message: error.message });
    }

    return next(error);
  });
};

const parseProductFields = (req, res, next) => {
  try {
    for (const field of ["price", "sizes"]) {
      if (typeof req.body[field] === "string") {
        req.body[field] = JSON.parse(req.body[field]);
      }
    }
    return next();
  } catch {
    return res.status(400).json({
      message: "Price and sizes must contain valid JSON objects",
    });
  }
};

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
  uploadProductImages,
  parseProductFields,
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
