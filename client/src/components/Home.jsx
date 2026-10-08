import { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import Product from "./Product";
import getApiErrorMessage from "../utils/apiErrorMessage";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/products");
        const allProducts = response.data?.data?.allProducts;
        if (!Array.isArray(allProducts)) {
          throw new Error("Unexpected products response");
        }
        if (isMounted) {
          setProducts(allProducts);
        }
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to load products.");
        if (isMounted) {
          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProductUpdate = (updatedProduct) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product,
      ),
    );
  };

  const handleProductDelete = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product._id !== productId),
    );
  };

  return (
    <main className="page page--home" id="home-page">
      <Navbar />
      <section className="home-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Your store</p>
            <h1 className="page-title">Products</h1>
          </div>
          <span className="product-count">{products.length} items</span>
        </div>
        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}
        {isLoading ? (
          <p className="empty-state">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="empty-state">No products yet. Create your first one.</p>
        ) : (
          <div className="product-grid" id="product-list">
            {products.map((product) => (
              <Product
                key={product._id}
                product={product}
                onUpdate={handleProductUpdate}
                onDelete={handleProductDelete}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
