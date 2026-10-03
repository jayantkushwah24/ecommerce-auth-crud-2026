import { body, validationResult } from "express-validator";

export const createProductValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required")
    .bail()
    .isString()
    .withMessage("title must be a string")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("title must contains characters between 2 to 50"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("description is required")
    .bail()
    .isString()
    .withMessage("description must be a string")
    .bail()
    .isLength({ min: 2, max: 500 })
    .withMessage("description must contains characters between 2 to 500"),
  body("price").isObject().withMessage("price must be an object"),
  body("price.currency")
    .exists()
    .withMessage("currency is required")
    .bail()
    .isString()
    .withMessage("currency must be a string")
    .bail()
    .isIn(["INR", "USD"])
    .withMessage("currency must be either INR or USD"),
  body("price.amount")
    .exists()
    .withMessage("amount is required")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Amount must be greater than or equal to 0"),
  body("sizes").isObject().withMessage("Price must be an object"),
  body("sizes.size")
    .exists()
    .withMessage("size is required")
    .bail()
    .isString()
    .withMessage("size must be a string")
    .bail()
    .isIn(["S", "M", "L", "XL", "XXL"])
    .withMessage("Size must be one of the following: S, M, L, XL, XXL"),
  body("sizes.stock")
    .exists()
    .withMessage("stock is required")
    .bail()
    .isInt({ min: 0 })
    .withMessage("stock must be greater than or equal to 0"),
  body("images")
    .isArray({ min: 1 })
    .withMessage("images are required")
    .custom((value) => {
      if (value.length > 5) {
        throw new Error("A product cannot have more than five images.");
      }
      return true;
    }),
  body("published").isBoolean().withMessage("published must be a boolean"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "product validation failed", errors: errors.array() });
    }

    next();
  },
];
