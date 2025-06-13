
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/quiz.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User["role"];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
