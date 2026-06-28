import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { GlobalContext } from "../context/AuthContext.tsx";

// inside the component:


const Navbar = () => {
  
  const navigate = useNavigate();
    return (
      <nav className="site-nav sticky top-0 z-50 flex items-center justify-between px-10 py-4 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="site-nav-brand flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <span className="text-base font-medium">MediCare AI</span>
        </div>
   
        <div className="flex items-center gap-3">
          
 
          
          <button className="text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap" onClick={() => navigate("/login")}>
            Doctor Portal
          </button>
          
        </div>
      </nav>
    )
}
export default Navbar
