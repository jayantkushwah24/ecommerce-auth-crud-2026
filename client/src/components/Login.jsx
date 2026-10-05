import React from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../config/axiosInstance";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleFormSubmit = (data) => {
    axiosInstance
      .post("/auth/login", data)
      .then((response) => {
        alert(response.data?.message);
      })
      .catch((error) => {
        alert(error.response?.data?.message || error.message);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit((data) => handleFormSubmit(data))}>
        {errors.email && <span>Email is required</span>}
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
        />
        {errors.password && <span>Password is required</span>}
        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: true })}
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
