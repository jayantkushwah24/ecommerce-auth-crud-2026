import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";
import getApiErrorMessage from "../utils/apiErrorMessage";

const CreateProduct = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const handleCreateProduct = async (data) => {
    try {
      const {
        title,
        description,
        size,
        quantity,
        price: priceData,
        currency,
        images,
      } = data;

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      const sizes = {
        size,
        stock: Number(quantity),
      };
      formData.append("sizes", JSON.stringify(sizes));
      const price = {
        amount: Number(priceData),
        currency,
      };
      formData.append("price", JSON.stringify(price));
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
      }

      await axiosInstance.post("/products", formData);
      toast.success("Product created successfully.");
      navigate("/home");
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create product."));
    }
  };

  return (
    <main className="page page--form" id="create-product-page">
      <section className="form-card">
        <button
          className="button button--text form-card__back"
          type="button"
          onClick={() => navigate("/home")}
        >
          ← Back to products
        </button>
        <p className="eyebrow">Inventory</p>
        <h1 className="page-title">Create a product</h1>
        <p className="form-card__subtitle">
          Add details and images for your store listing.
        </p>
        <form
          className="form product-create-form"
          onSubmit={handleSubmit(handleCreateProduct, () =>
            toast.error("Please correct the highlighted product details."),
          )}
        >
          <label className="form-field" htmlFor="product-title">
            <span>Product title</span>
            <input
              id="product-title"
              type="text"
              placeholder="e.g. Everyday cotton shirt"
              {...register("title", { required: true, minLength: 2, maxLength: 50 })}
            />
            {errors.title && (
              <span className="field-error">Enter a title (2–50 characters)</span>
            )}
          </label>
          <label className="form-field" htmlFor="product-description">
            <span>Description</span>
            <textarea
              id="product-description"
              placeholder="Describe your product"
              rows="4"
              {...register("description", {
                required: true,
                minLength: 2,
                maxLength: 500,
              })}
            />
            {errors.description && (
              <span className="field-error">
                Enter a description (2–500 characters)
              </span>
            )}
          </label>
          <div className="form-grid">
            <label className="form-field" htmlFor="product-size">
              <span>Size</span>
              <select
                id="product-size"
                {...register("size", { required: true })}
              >
                <option value="">Select a size</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
              {errors.size && <span className="field-error">Select a size</span>}
            </label>
            <label className="form-field" htmlFor="product-quantity">
              <span>Quantity in stock</span>
              <input
                id="product-quantity"
                type="number"
                min="0"
                step="1"
                {...register("quantity", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                })}
              />
              {errors.quantity && (
                <span className="field-error">Enter a non-negative quantity</span>
              )}
            </label>
          </div>
          <div className="form-grid">
            <label className="form-field" htmlFor="product-price">
              <span>Price</span>
              <input
                id="product-price"
                type="number"
                min="0"
                step="1"
                {...register("price", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                })}
              />
              {errors.price && (
                <span className="field-error">Enter a non-negative price</span>
              )}
            </label>
            <label className="form-field" htmlFor="product-currency">
              <span>Currency</span>
              <select
                id="product-currency"
                {...register("currency", { required: true })}
              >
                <option value="">Select currency</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
              {errors.currency && (
                <span className="field-error">Select a currency</span>
              )}
            </label>
          </div>
          <label className="form-field" htmlFor="product-images">
            <span>Product images</span>
            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              {...register("images", {
                required: true,
                validate: (files) =>
                  files.length <= 5 || "You can upload a maximum of 5 images",
              })}
            />
            <span className="form-field__hint">
              Choose between 1 and 5 images.
            </span>
            {errors.images && (
              <span className="field-error">
                {errors.images.message || "Choose at least one image"}
              </span>
            )}
          </label>
          <button
            className="button button--primary button--full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating product..." : "Create product"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default CreateProduct;
