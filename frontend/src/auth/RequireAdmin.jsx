import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext";

export default function RequireAdmin() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "ADMIN") {
        return <Navigate to="/access-denied" replace />;
    }

    return <Outlet />;
}