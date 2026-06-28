import { createContext, useState, useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { type ReactNode } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "doctor" | "admin" | "user";
  specialty?: string;
}



interface GlobalContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL;

export default function GlobalState({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const { password, __v, ...safeUser } = res.data;
        setUser(safeUser);
      })
      .catch(err => console.log("❌ auth/me failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const login = (userData: User) => {
    const { password, __v, ...safeUser } = userData as any;
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