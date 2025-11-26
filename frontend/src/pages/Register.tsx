import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { registerUser, loginUser, clearError } from "../store/slices/authSlice";
import { registerSchema, RegisterFormData } from "../utils/validation";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/tasks");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(clearError());
    const result = await dispatch(
      registerUser({ username: data.username, password: data.password })
    );
    if (registerUser.fulfilled.match(result)) {
      const loginResult = await dispatch(
        loginUser({ username: data.username, password: data.password })
      );
      if (loginUser.fulfilled.match(loginResult)) {
        navigate("/tasks");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      {/* subtle background pattern, same as Login */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),_transparent_55%)]" />

      <header className="w-screen fixed top-0 z-30 backdrop-blur-sm bg-white/80 border-b border-slate-200/70 shadow-sm">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              <span className="text-green-500">Task</span>Manager
            </h1>
          </div>
        </div>
      </header>

      <div className="relative max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-[0_18px_45px_rgba(15,23,42,0.12)] rounded-2xl px-7 py-8 sm:px-9 sm:py-9">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-slate-500">
              Start managing your tasks in a few seconds.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  {...register("username")}
                  type="text"
                  autoComplete="username"
                  className={`block w-full px-3.5 py-2.5 text-sm rounded-lg border transition-all duration-150 bg-slate-50/80 focus:bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.username ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="text-sm">⚠</span>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  autoComplete="new-password"
                  className={`block w-full px-3.5 py-2.5 text-sm rounded-lg border transition-all duration-150 bg-slate-50/80 focus:bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.password ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="text-sm">⚠</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  autoComplete="new-password"
                  className={`block w-full px-3.5 py-2.5 text-sm rounded-lg border transition-all duration-150 bg-slate-50/80 focus:bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-slate-300"
                  }`}
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span className="text-sm">⚠</span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full inline-flex justify-center items-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>

              <p className="mt-3 text-sm text-slate-500 text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:text-green-500 underline-offset-4 hover:underline transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
