import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Services from "./pages/Services";
import Book from "./pages/Book";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import AdminAddBooking from "./pages/AdminAddBooking"

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/services" />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book" element={<Book />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/add-booking" element={<AdminAddBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;