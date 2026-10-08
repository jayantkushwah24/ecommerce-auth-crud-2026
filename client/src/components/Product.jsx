import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";
import getApiErrorMessage from "../utils/apiErrorMessage";

const Product = ({ product, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({});

  const startEditing = () => {
    setFormData({
      title: product.title || "",
      description: product.description || "",
      amount: product.price?.amount ?? 0,
      currency: product.price?.currency || "INR",
      size: product.sizes?.size || "S",
      stock: product.sizes?.stock ?? 0,
      published: Boolean(product.published),
    });
    setErrorMessage("");
    setIsEditing(true);
  };

  const handleFieldChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await axiosInstance.put(`/products/${product._id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: {
          amount: Number(formData.amount),
          currency: formData.currency,
        },
        sizes: {
          size: formData.size,
          stock: Number(formData.stock),
        },
        published: formData.published,
      });

      onUpdate(response.data.product);
      setIsEditing(false);
      toast.success("Product updated successfully.");
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to update product.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.title}"?`)) {
      return;
    }

    setErrorMessage("");
    try {
      await axiosInstance.delete(`/products/${product._id}`);
      onDelete(product._id);
      toast.success("Product deleted successfully.");
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to delete product.");
      setErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <article className="product-card" id={`product-${product._id}`}>
      <div className="product-card__images">
        {product.images?.map((image, index) => (
          <img
            className="product-card__image"
            key={`${image}-${index}`}
            src={image}
            alt={`${product.title}, image ${index + 1}`}
            loading="lazy"
          />
        ))}
      </div>

      {isEditing ? (
        <form className="product-edit-form" onSubmit={handleUpdate}>
          <h2 className="product-edit-form__title">Edit product</h2>
          <label className="form-field" htmlFor={`title-${product._id}`}>
            <span>Title</span>
            <input
              id={`title-${product._id}`}
              name="title"
              value={formData.title}
              onChange={handleFieldChange}
              minLength="2"
              maxLength="50"
              required
            />
          </label>
          <label className="form-field" htmlFor={`description-${product._id}`}>
            <span>Description</span>
            <textarea
              id={`description-${product._id}`}
              name="description"
              value={formData.description}
              onChange={handleFieldChange}
              minLength="2"
              maxLength="500"
              rows="3"
              required
            />
          </label>
          <div className="product-edit-form__row">
            <label className="form-field" htmlFor={`amount-${product._id}`}>
              <span>Price</span>
              <input
                id={`amount-${product._id}`}
                name="amount"
                type="number"
                min="0"
                step="1"
                value={formData.amount}
                onChange={handleFieldChange}
                required
              />
            </label>
            <label className="form-field" htmlFor={`currency-${product._id}`}>
              <span>Currency</span>
              <select
                id={`currency-${product._id}`}
                name="currency"
                value={formData.currency}
                onChange={handleFieldChange}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          <div className="product-edit-form__row">
            <label className="form-field" htmlFor={`size-${product._id}`}>
              <span>Size</span>
              <select
                id={`size-${product._id}`}
                name="size"
                value={formData.size}
                onChange={handleFieldChange}
              >
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field" htmlFor={`stock-${product._id}`}>
              <span>Stock</span>
              <input
                id={`stock-${product._id}`}
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleFieldChange}
                required
              />
            </label>
          </div>
          <label className="checkbox-field" htmlFor={`published-${product._id}`}>
            <input
              id={`published-${product._id}`}
              name="published"
              type="checkbox"
              checked={formData.published}
              onChange={handleFieldChange}
            />
            Published
          </label>
          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}
          <div className="product-card__actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="product-card__content">
          <div className="product-card__heading">
            <h2 className="product-card__title">{product.title}</h2>
            <span
              className={`product-status${product.published ? " product-status--published" : ""}`}
            >
              {product.published ? "Published" : "Draft"}
            </span>
          </div>
          <p className="product-card__description">{product.description}</p>
          <p className="product-card__detail">
            <strong>Price:</strong> {product.price?.currency}{" "}
            {product.price?.amount}
          </p>
          <p className="product-card__detail">
            <strong>Size:</strong> {product.sizes?.size}
            <span aria-hidden="true"> · </span>
            <strong>Stock:</strong> {product.sizes?.stock}
          </p>
          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}
          <div className="product-card__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={startEditing}
            >
              Edit
            </button>
            <button
              className="button button--danger"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default Product;
