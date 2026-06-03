import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Pro Nails</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/book">Book Appointment</Link>
        <Link to="/services">Services</Link>
        {isAdmin && <Link to="/admin">Admin</Link>}
        {isAdmin && <Link to="/admin/add-booking">Add Booking</Link>}
        {isAdmin && <Link to="/admin/analytics">Analytics</Link>}
      </div>

      <div className="navbar-admin">
        {isAdmin && (
          <button type="button" className="navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
