import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/client/Home";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client */}
        <Route path="/" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}