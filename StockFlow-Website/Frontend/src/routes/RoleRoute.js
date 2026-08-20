import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowed }) {
  const { user } = useAuth();
  const role = String(user?.role || "")
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();
  return allowed.includes(role) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
