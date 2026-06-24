


//import { useContext } from "react";

import Login from "../pages/auth/Login";

export default function PrivateRouter({ user, children }) {
  //const { loading } = useContext(GlobalContext);

  //if (loading) return null; // ✅ wait for auth check to complete
  
  if (user.isconnected) {
    return children;
  } else {
    return <Login />;
  }
}
  