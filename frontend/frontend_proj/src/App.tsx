import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/client/Home";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/doctor/Dashboard";
import PrivateRouter from './privacy/PrivateRouter.tsx';
import PrivateRouterAdmin from './privacy/PrivateRouterAdmin.tsx';
import ForceRedirect from './privacy/ForceRedirect.tsx';
import Noaccess from "./pages/auth/Noaccess.tsx";
import GlobalState, { GlobalContext } from "./context/AuthContext.tsx";
import PatientDetail from "./pages/doctor/PatientDetail.tsx";
import NotesResearch from "./pages/doctor/NoteSearch.tsx";
function AppRoutes() {
  const { user, loading } = useContext(GlobalContext)!;

  if (loading) return null;

  const userInfo = {
    isconnected: !!user,
    role: user?.role,
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<ForceRedirect user={userInfo}><Login /></ForceRedirect>} />
      <Route path="/doctor/dashboard" element={<PrivateRouter user={userInfo}><Dashboard /></PrivateRouter>} />
      <Route path="/doctor/patient/:id"  element={<PrivateRouter user={userInfo}><PatientDetail /></PrivateRouter>} />
      <Route path="/doctor/notesresearch"  element={<PrivateRouter user={userInfo}><NotesResearch /></PrivateRouter>} />
      <Route path="/*" element={<Noaccess />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalState>
        <AppRoutes />
      </GlobalState>
    </BrowserRouter>
  );
}