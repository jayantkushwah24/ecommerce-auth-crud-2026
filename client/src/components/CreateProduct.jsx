import React from "react";
import { useNavigate } from "react-router";

const CreateProduct = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate("/home")}>Back to Home</button>
      <h1>Create Product</h1>
      <form>
        <input type="text" placeholder="Product Title" />
        <input type="text" placeholder="Description" />
        <label htmlFor="">Sizes: </label>
        <select name="size" id="size">
          <option value="">Select Size</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
        <input type="number" placeholder="Quantity" />
        <label htmlFor="">Price: </label>
        <input type="number" placeholder="Amount" />
        <label htmlFor="">Currency</label>
        <select name="currency" id="currency">
          <option value="">Select Currency</option>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select>
      </form>
    </div>
  );
};

export default CreateProduct;
