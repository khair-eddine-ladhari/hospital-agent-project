import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  user: { role: string } | null;
  children: ReactNode;
}

export default function ForceRedirect({ user, children }: Props) {
  if (!user) return children;

  if (user.role === "admin") return <Navigate to="/admin/doctors" replace />;
  if (user.role === "doctor") return <Navigate to="/doctor/dashboard" replace />;

  return children;
}