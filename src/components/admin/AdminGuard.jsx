import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const password = localStorage.getItem("tanadorada_admin_password");

  if (!password) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
