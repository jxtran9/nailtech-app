import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Book from "./pages/Book";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import AdminAddBooking from "./pages/AdminAddBooking";
import Analytics from "./pages/Analytics";
import AdminLogin from "./pages/AdminLogin";

function ProtectedAdminRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book" element={<Book />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/add-booking"
          element={
            <ProtectedAdminRoute>
              <AdminAddBooking />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedAdminRoute>
              <Analytics />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
