



/*


import { createContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useEffect } from "react";
export const GlobalContext = createContext();
const API_URL = import.meta.env.VITE_API_URL
export default function GlobalState({ children }) {
    
  const navigate = useNavigate();


  


 const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true); // ✅ add this

useEffect(() => {
  const token = sessionStorage.getItem('token');
 

  if (!token) {
    setLoading(false);
    return;
  }




  axios.get(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => {
     
      const { password, __v, ...safeUser } = res.data;
      setUser(safeUser);
    })
    .catch((err) => {
      console.log("❌ auth/me failed:", err);
    })
    .finally(() => setLoading(false));
}, []);

// expose loading:

   











  

  const login = (userData) => {
  const { password, __v, ...safeUser } = userData;
  setUser(safeUser);
};
  const logout = () => {
    
    setUser(null);
    sessionStorage.removeItem("token");
    navigate("/");
  
  };


  

  return (
    <GlobalContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </GlobalContext.Provider>
  );
}
  */