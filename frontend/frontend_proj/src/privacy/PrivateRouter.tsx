import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  user: { role: string } | null;
  children: ReactNode;
}

export default function PrivateRouter({ user, children }: Props) {
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "doctor" || user.role === "admin") {
    return children;
  }

  return <Navigate to="/login" replace />;
}