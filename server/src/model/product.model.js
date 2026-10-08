import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      currency: {
        type: String,
        required: true,
        enum: ["INR", "USD"],
        default: "INR",
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },
    sizes: {
      size: {
        type: String,
        required: true,
        enum: ["S", "M", "L", "XL", "XXL"],
      },
      stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 1 && v.length <= 5;
        },
        message: "A product must have between one and five images.",
      },
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const ProductModel = mongoose.model("products", productSchema);

export default ProductModel;
