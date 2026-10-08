import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "./components/Login";
import Register from "./components/Register";
import CreateProduct from "./components/CreateProduct";
import Home from "./components/Home";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/create-product",
      element: <CreateProduct />,
    },
    {
      path: "/home",
      element: <Home />,
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
