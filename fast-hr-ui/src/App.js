import { Navigate, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import NavMenu from "./components/NavMenu";

import Register from "./pages/Register";
import Login from "./pages/Login";

import WorkerHome from "./pages/WorkerHome";
import HrWorkerHome from "./pages/HrWorkerHome";
import AdminHome from "./pages/AdminHome";

import MyProfile from "./pages/MyProfile";
import MyReviews from "./pages/MyReviews";
import MyPayroll from "./pages/MyPayroll";

// HR worker pages (CRUD)
import PerformanceReviews from "./pages/PerformanceReviews";
import PayrollRecords from "./pages/PayrollRecords";

// Shared pages (under development / placeholder)
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Positions from "./pages/Positions";
import Metrics from "./pages/Metrics";

// Admin pages (separate names in your tree)
import UsersAdmin from "./pages/UsersAdmin";
import AdminDepartments from "./pages/AdminDepartments";
import AdminPositions from "./pages/AdminPositions";

function getToken() {
  return sessionStorage.getItem("fast_hr_token");
}

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("fast_hr_user") || "null");
  } catch {
    return null;
  }
}

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ allow, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

// Optional: after login, send user to their home automatically.
function RoleHomeRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "employee") return <Navigate to="/worker" replace />;
  if (user.role === "hr_worker") return <Navigate to="/hr-worker" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleHomeRedirect />
          </ProtectedRoute>
        }
      />

      {/* Auth pages (NO sidebar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App layout (WITH sidebar) */}
      <Route
        element={
          <ProtectedRoute>
            <NavMenu />
          </ProtectedRoute>
        }
      >
        {/* Homes */}
        <Route
          path="/worker"
          element={
            <RoleRoute allow={["employee"]}>
              <WorkerHome />
            </RoleRoute>
          }
        />

        <Route
          path="/hr-worker"
          element={
            <RoleRoute allow={["hr_worker"]}>
              <HrWorkerHome />
            </RoleRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute allow={["admin"]}>
              <AdminHome />
            </RoleRoute>
          }
        />

        {/* Employee pages */}
        <Route
          path="/my-profile"
          element={
            <RoleRoute allow={["employee"]}>
              <MyProfile />
            </RoleRoute>
          }
        />

        <Route
          path="/my-reviews"
          element={
            <RoleRoute allow={["employee"]}>
              <MyReviews />
            </RoleRoute>
          }
        />

        <Route
          path="/my-payroll"
          element={
            <RoleRoute allow={["employee"]}>
              <MyPayroll />
            </RoleRoute>
          }
        />

        {/* HR worker pages */}
        <Route
          path="/performance-reviews"
          element={
            <RoleRoute allow={["hr_worker"]}>
              <PerformanceReviews />
            </RoleRoute>
          }
        />

        <Route
          path="/payroll-records"
          element={
            <RoleRoute allow={["hr_worker"]}>
              <PayrollRecords />
            </RoleRoute>
          }
        />

        {/* Shared / under-development pages (HR worker can also see if you want) */}
        <Route
          path="/users"
          element={
            <RoleRoute allow={["hr_worker"]}>
              <Users />
            </RoleRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <RoleRoute allow={["hr_worker"]}>
              <Departments />
            </RoleRoute>
          }
        />

        <Route
          path="/positions"
          element={
            <RoleRoute allow={["hr_worker"]}>
              <Positions />
            </RoleRoute>
          }
        />

        <Route
          path="/metrics"
          element={
            <RoleRoute allow={["hr_worker", "admin"]}>
              <Metrics />
            </RoleRoute>
          }
        />

        {/* Admin-specific pages (renamed like in your tree) */}
        <Route
          path="/admin/users"
          element={
            <RoleRoute allow={["admin"]}>
              <UsersAdmin />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/departments"
          element={
            <RoleRoute allow={["admin"]}>
              <AdminDepartments />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/positions"
          element={
            <RoleRoute allow={["admin"]}>
              <AdminPositions />
            </RoleRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
