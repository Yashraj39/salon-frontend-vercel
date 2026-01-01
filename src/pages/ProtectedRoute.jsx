import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login first");
    return <Navigate to="/login" replace />;
  }

  return children;
}
