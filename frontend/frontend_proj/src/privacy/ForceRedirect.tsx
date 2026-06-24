


import { Navigate } from "react-router-dom";

export default function ForceRedirect({ user, children }) {
  if (user?.isconnected) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  return children;
}

