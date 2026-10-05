import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import axiosInstance from "../config/axiosInstance";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const handleFormSubmit = (data) => {
    axiosInstance
      .post("/auth/register", data)
      .then((response) => {
        alert(response.data?.message);
        navigate("/");
        
      })
      .catch((error) => {
        alert(error.response?.data?.message || error.message);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit((data) => handleFormSubmit(data))}>
        {errors.name && <span>Name is required</span>}
        <input
          type="text"
          placeholder="Name"
          {...register("name", { required: true })}
        />
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
        {errors.confirmPassword && <span>Confirm Password is required</span>}
        <input
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword", { required: true })}
        />
        <button type="submit">Register</button>
        <p>
          Already have an account? <a href="/">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
