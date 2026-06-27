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

import DoctorForm from "./pages/admin/DoctorForm.tsx";
import DoctorList from "./pages/admin/DoctorList.tsx";

function AppRoutes() {
  const { user, loading } = useContext(GlobalContext)!;
 console.log("USER:", user);
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<ForceRedirect user={user}><Login /></ForceRedirect>} />
      <Route path="/doctor/dashboard" element={<PrivateRouter user={user}><Dashboard /></PrivateRouter>} />
      <Route path="/doctor/patient/:id" element={<PrivateRouter user={user}><PatientDetail /></PrivateRouter>} />
      <Route path="/doctor/notesresearch" element={<PrivateRouter user={user}><NotesResearch /></PrivateRouter>} />

      <Route path="/admin/doctors" element={<PrivateRouterAdmin user={user}><DoctorList /></PrivateRouterAdmin>} />
      <Route path="/admin/doctors/new" element={<PrivateRouterAdmin user={user}><DoctorForm /></PrivateRouterAdmin>} />
      <Route path="/admin/doctors/:id/edit" element={<PrivateRouterAdmin user={user}><DoctorForm /></PrivateRouterAdmin>} />
     

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