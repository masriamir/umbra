/**
 * @fileoverview Route guard that redirects unauthenticated users to /login.
 */

import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Spinner from "./ui/Spinner";

/**
 * Renders nested routes when authenticated; redirects to /login otherwise.
 *
 * Shows a full-page spinner while the initial session check is in flight.
 *
 * @returns {JSX.Element}
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
