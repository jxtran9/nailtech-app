import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Book from "./pages/Book";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import AdminAddBooking from "./pages/AdminAddBooking";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book" element={<Book />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/add-booking" element={<AdminAddBooking />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
