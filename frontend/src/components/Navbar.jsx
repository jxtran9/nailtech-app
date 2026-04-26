import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/services">Services</Link>
      <Link to="/book">Book Appointment</Link>
      <Link to="/admin">Admin</Link>
      <Link to="/admin/add-booking">Add Booking</Link>
    </nav>
  );
}