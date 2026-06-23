import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/client/Home";
import Login from "./pages/auth/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}