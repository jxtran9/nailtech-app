import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Pro Nails</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/book">Book Appointment</Link>
        <Link to="/services">Services</Link>
      </div>

      <div className="navbar-admin">
        <Link to="/admin">Admin Portal</Link>
      </div>
    </nav>
  );
}
