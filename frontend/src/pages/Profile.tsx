import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  clearError,
} from "../store/slices/profileSlice";
import { logout } from "../store/slices/authSlice";
import ProfileDropdown from "../components/ProfileDropdown";

const profileSchema = z.object({
  email: z.string().email("Invalid email format").optional().nullable(),
  firstName: z
    .string()
    .max(50, "First name must be at most 50 characters")
    .optional()
    .nullable(),
  lastName: z
    .string()
    .max(50, "Last name must be at most 50 characters")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .nullable(),
  avatar: z.string().url("Invalid URL format").optional().nullable(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { profile, isLoading, error } = useSelector(
    (state: RootState) => state.profile
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      bio: "",
      avatar: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        email: profile.email ?? "",
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        bio: profile.bio ?? "",
        avatar: profile.avatar ?? "",
      });
    }
  }, [profile, profileForm]);
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setSuccessMessage("");
    };
  }, [dispatch]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    dispatch(clearError());
    setSuccessMessage("");
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    dispatch(clearError());
    setSuccessMessage("");
    const result = await dispatch(
      changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    );
    if (changePassword.fulfilled.match(result)) {
      setSuccessMessage("Password changed successfully!");
      passwordForm.reset();
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Sidebar handlers
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName[0].toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.14),_transparent_55%)]" />

      {/* Top Navbar - fixed and full width */}
      <header className="w-screen fixed top-0 z-30 backdrop-blur-sm bg-white/80 border-b border-slate-200/70 shadow-sm">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              <span className="text-green-500">Task</span>Manager
            </h1>
          </div>
          <ProfileDropdown />
        </div>
      </header>

      {/* Content below navbar */}
      <div className="pt-[84px] flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col bg-white/90 border border-slate-200/80 shadow-lg w-72 min-h-[861px] mr-10 py-8 px-7 h-fit self-start">
          <div className="flex flex-col items-center gap-3 mb-7">
            <div className="w-24 h-24 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-2xl">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                <p>
                  Hey,{" "}
                  {profile?.firstName && profile?.lastName
                    ? `${profile.firstName}`
                    : profile?.firstName || profile?.username || "User"}
                  !
                </p>
              </h2>
            </div>
          </div>
          <nav className="flex-1 w-full mt-4">
            <button
              onClick={() => navigate("/tasks")}
              className="w-full text-left px-4 py-2 rounded-lg font-medium transition bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
            >
              All Tasks
            </button>
          </nav>
          <div className="mt-10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 border border-red-200 transition shadow"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main profile content */}
        <div className="flex-1">
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {successMessage && (
              <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 animate-fade-in">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-green-800 font-medium">
                    {successMessage}
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 animate-fade-in">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-red-800 font-medium">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-2xl">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile?.firstName || profile?.username || "User"}
                  </h2>
                  <p className="text-gray-600">
                    {profile?.email || profile?.username}
                  </p>
                  {profile?.bio && (
                    <p className="text-sm text-gray-500 mt-2">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "profile"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "password"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Change Password
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          First Name
                        </label>
                        <input
                          {...profileForm.register("firstName")}
                          type="text"
                          className={`w-full px-4 py-3 border ${
                            profileForm.formState.errors.firstName
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                          placeholder="Enter your first name"
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="mt-2 text-sm text-red-600">
                            {profileForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Last Name
                        </label>
                        <input
                          {...profileForm.register("lastName")}
                          type="text"
                          className={`w-full px-4 py-3 border ${
                            profileForm.formState.errors.lastName
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                          placeholder="Enter your last name"
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="mt-2 text-sm text-red-600">
                            {profileForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email
                      </label>
                      <input
                        {...profileForm.register("email")}
                        type="email"
                        className={`w-full px-4 py-3 border ${
                          profileForm.formState.errors.email
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                        placeholder="Enter your email"
                      />
                      {profileForm.formState.errors.email && (
                        <p className="mt-2 text-sm text-red-600">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Bio
                      </label>
                      <textarea
                        {...profileForm.register("bio")}
                        rows={4}
                        className={`w-full px-4 py-3 border ${
                          profileForm.formState.errors.bio
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none`}
                        placeholder="Tell us about yourself..."
                      />
                      {profileForm.formState.errors.bio && (
                        <p className="mt-2 text-sm text-red-600">
                          {profileForm.formState.errors.bio.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="avatar"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Avatar URL
                      </label>
                      <input
                        {...profileForm.register("avatar")}
                        type="url"
                        className={`w-full px-4 py-3 border ${
                          profileForm.formState.errors.avatar
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      {profileForm.formState.errors.avatar && (
                        <p className="mt-2 text-sm text-red-600">
                          {profileForm.formState.errors.avatar.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                )}
                {/* Password Tab */}
                {activeTab === "password" && (
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-6 max-w-md"
                  >
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Current Password
                      </label>
                      <input
                        {...passwordForm.register("currentPassword")}
                        type="password"
                        className={`w-full px-4 py-3 border ${
                          passwordForm.formState.errors.currentPassword
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                        placeholder="Enter current password"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="mt-2 text-sm text-red-600">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        New Password
                      </label>
                      <input
                        {...passwordForm.register("newPassword")}
                        type="password"
                        className={`w-full px-4 py-3 border ${
                          passwordForm.formState.errors.newPassword
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                        placeholder="Enter new password"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Confirm New Password
                      </label>
                      <input
                        {...passwordForm.register("confirmPassword")}
                        type="password"
                        className={`w-full px-4 py-3 border ${
                          passwordForm.formState.errors.confirmPassword
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                        placeholder="Confirm new password"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                    >
                      {isLoading ? "Changing Password..." : "Change Password"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
