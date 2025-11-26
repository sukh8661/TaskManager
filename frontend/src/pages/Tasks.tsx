import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  clearError,
  Task,
} from "../store/slices/taskSlice";
import { fetchProfile } from "../store/slices/profileSlice";
import { logout } from "../store/slices/authSlice";
import { taskSchema, TaskFormData } from "../utils/validation";
import ProfileDropdown from "../components/ProfileDropdown";

const Tasks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tasks, isLoading, error } = useSelector(
    (state: RootState) => state.tasks
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.profile);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", status: "pending" },
  });

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProfile());
  }, [dispatch]);
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  useEffect(() => {
    if (editingTask) {
      setValue("title", editingTask.title);
      setValue("description", editingTask.description || "");
      setValue("status", editingTask.status);
      setShowForm(true);
    }
  }, [editingTask, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    dispatch(clearError());
    if (editingTask) {
      await dispatch(updateTask({ id: editingTask.id, task: data }));
      setEditingTask(null);
    } else {
      await dispatch(createTask(data));
    }
    reset();
    setShowForm(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await dispatch(deleteTask(id));
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    reset();
    setShowForm(false);
  };

  const toggleStatus = async (task: Task) => {
    await dispatch(
      updateTask({
        id: task.id,
        task: { status: task.status === "pending" ? "completed" : "pending" },
      })
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const navToAll = () => setFilter("all");
  const navToPending = () => setFilter("pending");
  const navToCompleted = () => setFilter("completed");
  const handleProfile = () => navigate("/profile");
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Helper for sidebar avatar initials
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile?.firstName) return profile.firstName[0].toUpperCase();
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
                    : profile?.firstName ||
                      profile?.username ||
                      user?.username ||
                      "User"}
                  !
                </p>
              </h2>
            </div>
          </div>
          <nav className="flex-1 w-full mt-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={navToAll}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                    filter === "all"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  All Tasks
                </button>
              </li>
              <li>
                <button
                  onClick={navToPending}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                    filter === "pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  Pending Tasks
                </button>
              </li>
              <li>
                <button
                  onClick={navToCompleted}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                    filter === "completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  Completed Tasks
                </button>
              </li>
            </ul>
          </nav>
          <div className="mt-10">
            <button
              onClick={handleProfile}
              className="w-full px-4 py-2 mb-2 items-center justify-center rounded-lg font-medium transition bg-green-50 hover:bg-green-200 text-green-700 border border-green-200"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 border border-red-200 transition shadow"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Total tasks
                    </p>
                    <p className="text-3xl font-semibold text-slate-900 mt-1.5">
                      {tasks.length}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-full p-3">
                    <svg
                      className="w-7 h-7 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-amber-100 rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Pending
                    </p>
                    <p className="text-3xl font-semibold text-slate-900 mt-1.5">
                      {pendingCount}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-full p-3">
                    <svg
                      className="w-7 h-7 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Completed
                    </p>
                    <p className="text-3xl font-semibold text-slate-900 mt-1.5">
                      {completedCount}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-full p-3">
                    <svg
                      className="w-7 h-7 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
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
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Create/Edit Task Form */}
            {showForm && (
              <div className="mb-7 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-lg p-6 sm:p-7">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                      {editingTask ? "Edit task" : "Create new task"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {editingTask
                        ? "Update the task details and status."
                        : "Add a title and optional description to get started."}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Title *
                    </label>
                    <input
                      {...register("title")}
                      type="text"
                      className={`block w-full px-3.5 py-2.5 text-sm rounded-lg border transition-all bg-slate-50/80 focus:bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.title ? "border-red-300" : "border-slate-300"
                      }`}
                      placeholder="Enter task title"
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <span className="text-sm">⚠</span>
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className={`block w-full px-3.5 py-2.5 text-sm rounded-lg border transition-all bg-slate-50/80 focus:bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                        errors.description
                          ? "border-red-300"
                          : "border-slate-300"
                      }`}
                      placeholder="Add task description (optional)"
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <span className="text-sm">⚠</span>
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Status *
                    </label>
                    <select
                      {...register("status")}
                      className="block w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 inline-flex justify-center items-center px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform transition-transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          Saving...
                        </span>
                      ) : editingTask ? (
                        "Update task"
                      ) : (
                        "Create task"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter and Create Button */}
            <div className="mb-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="inline-flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full border transition-all ${
                    filter === "all"
                      ? "bg-green-600 text-white border-green-600 shadow-md"
                      : "bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full border transition-all ${
                    filter === "pending"
                      ? "bg-amber-500 text-white border-amber-500 shadow-md"
                      : "bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full border transition-all ${
                    filter === "completed"
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                      : "bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
              {!showForm && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingTask(null);
                    reset();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create new task
                </button>
              )}
            </div>

            {/* Tasks List */}
            {isLoading && tasks.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  className="animate-spin h-10 w-10 text-green-600 mx-auto mb-4"
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
                <p className="text-slate-500 text-sm sm:text-base">
                  Loading your tasks...
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-16 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-md">
                <svg
                  className="w-20 h-20 text-slate-200 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-slate-600 text-base font-medium mb-1.5">
                  {filter === "all"
                    ? "No tasks yet. Create your first task!"
                    : `No ${filter} tasks found.`}
                </p>
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="text-sm font-medium text-green-600 hover:text-green-700 underline-offset-4 hover:underline"
                  >
                    View all tasks
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 pb-10">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-md p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                      task.status === "completed" ? "opacity-90" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <h3
                        className={`text-base sm:text-lg font-semibold flex-1 ${
                          task.status === "completed"
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span
                        className={`ml-2 px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                          task.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {task.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-1">
                      <button
                        onClick={() => toggleStatus(task)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          task.status === "completed"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        }`}
                      >
                        {task.status === "completed"
                          ? "Mark as pending"
                          : "Mark as completed"}
                      </button>
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                      >
                        Delete
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                      Created:{" "}
                      {new Date(task.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
