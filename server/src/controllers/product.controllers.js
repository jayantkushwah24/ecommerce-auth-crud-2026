import { ImageKit, toFile } from "@imagekit/nodejs";
import { randomUUID } from "node:crypto";
import { config } from "../config/env.config.js";
import mongoose from "mongoose";
import ProductModel from "../model/product.model.js";

const imagekit = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

export async function createProduct(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "A product must have at least one image." });
    }

    const imageUrls = [];

    const uploadPromises = req.files.map(async (file) => {
      const uploadFile = await toFile(file.buffer, file.originalname, {
        type: file.mimetype,
      });

      return imagekit.files.upload({
        file: uploadFile,
        fileName: `${randomUUID()}-${file.originalname.replace(/[\\/]/g, "_")}`,
        folder: "/products",
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    uploadResults.forEach((result) => imageUrls.push(result.url));
    const newProduct = await ProductModel.create({
      title: req.body.title,
      description: req.body.description,
      images: imageUrls,
      price: {
        currency: req.body?.price?.currency,
        amount: req.body?.price?.amount,
      },
      sizes: {
        size: req.body?.sizes?.size?.trim(),
        stock: req.body?.sizes?.stock,
      },
    });

    return res.status(201).json({
      message: "product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Unable to create product" });
  }
}

export async function getAllProducts(req, res) {
  try {
    const allProducts = await ProductModel.find();

    return res.status(200).json({
      message: "All products fetched successfully",
      data: {
        allProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProductById(req, res) {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "product with given id fetched successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteProductById(req, res) {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const { title, description, price, sizes, published } = req.body || {};

    if (
      title === undefined &&
      description === undefined &&
      price === undefined &&
      sizes === undefined &&
      published === undefined
    ) {
      return res.status(400).json({
        message: "At least one product field must be provided",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
          message: "Title must be a non-empty string",
        });
      }

      if (title.trim().length < 2 || title.trim().length > 50) {
        return res.status(400).json({
          message: "Title must contain between 2 and 50 characters",
        });
      }

      product.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
        });
      }

      if (description.trim().length < 2 || description.trim().length > 500) {
        return res.status(400).json({
          message: "Description must contain between 2 and 500 characters",
        });
      }

      product.description = description.trim();
    }

    if (published !== undefined) {
      if (typeof published !== "boolean") {
        return res.status(400).json({
          message: "Published must be a boolean",
        });
      }

      product.published = published;
    }

    if (price !== undefined) {
      if (typeof price !== "object" || price === null || Array.isArray(price)) {
        return res.status(400).json({
          message: "Price must be an object",
        });
      }

      if (price.currency !== undefined) {
        if (
          typeof price.currency !== "string" ||
          !["INR", "USD"].includes(price.currency)
        ) {
          return res.status(400).json({
            message: "Currency must be either INR or USD",
          });
        }

        product.price.currency = price.currency;
      }

      if (price.amount !== undefined) {
        const amount = Number(price.amount);

        if (!Number.isInteger(amount) || amount < 0) {
          return res.status(400).json({
            message: "Amount must be an integer greater than or equal to 0",
          });
        }

        product.price.amount = amount;
      }
    }

    if (sizes !== undefined) {
      if (typeof sizes !== "object" || sizes === null || Array.isArray(sizes)) {
        return res.status(400).json({
          message: "Sizes must be an object",
        });
      }

      if (sizes.size !== undefined) {
        if (
          typeof sizes.size !== "string" ||
          !["S", "M", "L", "XL", "XXL"].includes(sizes.size)
        ) {
          return res.status(400).json({
            message: "Size must be one of: S, M, L, XL, XXL",
          });
        }

        product.sizes.size = sizes.size;
      }

      if (sizes.stock !== undefined) {
        const stock = Number(sizes.stock);

        if (!Number.isInteger(stock) || stock < 0) {
          return res.status(400).json({
            message: "Stock must be an integer greater than or equal to 0",
          });
        }

        product.sizes.stock = stock;
      }
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    return res.status(500).json({
      message: "Something went wrong while updating the product",
    });
  }
}
