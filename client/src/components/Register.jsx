import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";
import getApiErrorMessage from "../utils/apiErrorMessage";

const Register = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();

  const handleFormSubmit = async (data) => {
    try {
      await axiosInstance.post("/auth/register", data);
      toast.success("Your account has been created. You can now sign in.");
      navigate("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create your account."));
    }
  };

  return (
    <main className="auth-page" id="register-page">
      <section className="auth-card">
        <p className="eyebrow">Start selling</p>
        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Set up your store in a few steps.</p>
        <form
          className="form"
          onSubmit={handleSubmit(handleFormSubmit, () =>
            toast.error("Please correct the highlighted fields."),
          )}
        >
          <label className="form-field" htmlFor="register-name">
            <span>Name</span>
            <input
              id="register-name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              {...register("name", { required: true })}
            />
            {errors.name && (
              <span className="field-error">Name is required</span>
            )}
          </label>
          <label className="form-field" htmlFor="register-email">
            <span>Email</span>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="field-error">Email is required</span>
            )}
          </label>
          <label className="form-field" htmlFor="register-password">
            <span>Password</span>
            <input
              id="register-password"
              type="password"
              placeholder="Choose a password"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Use at least 8 characters",
                },
                validate: {
                  uppercase: (value) =>
                    /[A-Z]/.test(value) || "Include at least one uppercase letter",
                  lowercase: (value) =>
                    /[a-z]/.test(value) || "Include at least one lowercase letter",
                  number: (value) =>
                    /\d/.test(value) || "Include at least one number",
                  symbol: (value) =>
                    /[^A-Za-z0-9]/.test(value) ||
                    "Include at least one symbol",
                },
              })}
            />
            {errors.password && (
              <span className="field-error">
                {errors.password.message || "Choose a stronger password"}
              </span>
            )}
          </label>
          <label className="form-field" htmlFor="register-confirm-password">
            <span>Confirm password</span>
            <input
              id="register-confirm-password"
              type="password"
              placeholder="Enter your password again"
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <span className="field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </label>
          <button
            className="button button--primary button--full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="auth-card__footer">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
