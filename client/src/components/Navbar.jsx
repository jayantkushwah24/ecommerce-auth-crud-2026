import axiosInstance, { clearAccessToken } from "../config/axiosInstance";
import { NavLink, useNavigate } from "react-router";
import { toast } from "react-toastify";
import getApiErrorMessage from "../utils/apiErrorMessage";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    axiosInstance
      .post("/auth/logout")
      .then(() => {
        clearAccessToken();
        toast.success("You’ve been logged out.");
        navigate("/");
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Unable to log out."));
      });
  };

  return (
    <nav className="site-nav" id="site-navigation">
      <NavLink className="site-nav__brand" to="/home">
        Atelier
      </NavLink>
      <div className="site-nav__links">
        <NavLink className="site-nav__link" to="/home">
          Products
        </NavLink>
        <NavLink className="site-nav__link" to="/create-product">
          Add product
        </NavLink>
      </div>
      <button className="button button--secondary" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
