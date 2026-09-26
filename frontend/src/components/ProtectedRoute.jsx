import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas">
        <div className="h-10 w-10 rounded-full border-4 border-primary-100 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
