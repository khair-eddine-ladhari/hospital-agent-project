

/*
import { useContext } from "react";
import { GlobalContext } from "../context/AuthContext";
import Login from "../pages/Auth/Login";

export default function PrivateRouter({ user, children }) {
  const { loading } = useContext(GlobalContext);

  if (loading) return null; // ✅ wait for auth check to complete
  
  if (user.isconnected) {
    return children;
  } else {
    return <Login />;
  }
}
  */