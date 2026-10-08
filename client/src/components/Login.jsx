import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import axiosInstance, { setAccessToken } from "../config/axiosInstance";
import getApiErrorMessage from "../utils/apiErrorMessage";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleFormSubmit = async (data) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      setAccessToken(response.data.accessToken);
      toast.success("Welcome back! You’re signed in.");
      navigate("/home");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to sign in."));
    }
  };

  return (
    <main className="auth-page" id="login-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1 className="auth-card__title">Sign in</h1>
        <p className="auth-card__subtitle">Access your store dashboard.</p>
        <form
          className="form"
          onSubmit={handleSubmit(handleFormSubmit, () =>
            toast.error("Enter your email and password to sign in."),
          )}
        >
          <label className="form-field" htmlFor="login-email">
            <span>Email</span>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="field-error">Email is required</span>
            )}
          </label>
          <label className="form-field" htmlFor="login-password">
            <span>Password</span>
            <input
              id="login-password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <span className="field-error">Password is required</span>
            )}
          </label>
          <button
            className="button button--primary button--full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="auth-card__footer">
          Don&apos;t have an account? <Link to="/register">Register here</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
