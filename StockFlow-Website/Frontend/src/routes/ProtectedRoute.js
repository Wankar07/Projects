import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoaderCircle } from "lucide-react";
export default function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking)
    return (
      <div className="screen-loader">
        <LoaderCircle className="spin" /> Securing your workspace…
      </div>
    );
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
