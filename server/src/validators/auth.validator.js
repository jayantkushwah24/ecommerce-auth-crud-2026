import { body, validationResult } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .isLength({ min: 2, max: 20 })
    .withMessage("name must be between 2 to 20 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("email must be a valid email address")
    .bail()
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .bail()
    .isStrongPassword()
    .withMessage("password must be strong"),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirm password is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "register user validation failed",
        errors: errors.array(),
      });
    }

    next();
  },
];
