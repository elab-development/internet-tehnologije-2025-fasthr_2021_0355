import { Navigate, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Register from "./pages/Register";
import Login from "./pages/Login";
import "bootstrap/dist/css/bootstrap.min.css";

// If you already have these, import them instead of placeholders.
// import WorkerHome from "./pages/WorkerHome";
// import HrWorkerHome from "./pages/HrWorkerHome";
// import AdminHome from "./pages/AdminHome";

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

/* Placeholders so app compiles. Replace with your real pages. */
function WorkerHome() {
  const user = getUser();
  return (
    <div className="app-container">
      <div className="hr-card hr-card--padded">
        <h2 className="hr-page-title">WorkerHome.</h2>
        <p className="hr-page-subtitle">Hello {user?.name}. You are an employee.</p>
      </div>
    </div>
  );
}

function HrWorkerHome() {
  const user = getUser();
  return (
    <div className="app-container">
      <div className="hr-card hr-card--padded">
        <h2 className="hr-page-title">HrWorkerHome.</h2>
        <p className="hr-page-subtitle">Hello {user?.name}. You are an hr_worker.</p>
      </div>
    </div>
  );
}

function AdminHome() {
  const user = getUser();
  return (
    <div className="app-container">
      <div className="hr-card hr-card--padded">
        <h2 className="hr-page-title">AdminHome.</h2>
        <p className="hr-page-subtitle">Hello {user?.name}. You are an admin.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/worker"
          element={
            <ProtectedRoute>
              <RoleRoute allow={["employee"]}>
                <WorkerHome />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr-worker"
          element={
            <ProtectedRoute>
              <RoleRoute allow={["hr_worker"]}>
                <HrWorkerHome />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allow={["admin"]}>
                <AdminHome />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
