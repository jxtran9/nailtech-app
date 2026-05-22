import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="home-tagline">Powered by NailTech</p>
          <h1>Modern Nail Booking Made Simple</h1>
          <p>
            Request nail appointments online, view available services, and help
            the salon manage bookings more easily.
          </p>

          <div className="home-buttons">
            <Link to="/book" className="btn-primary">
              Book Appointment
            </Link>
            <Link to="/services" className="btn-secondary">
              View Services
            </Link>
          </div>
        </div>

        <div className="home-hero-image">
          <img src="/images/nail-hero.jpg" alt="Nail salon manicure" />
        </div>
      </section>

      <section className="home-section">
        <h2>About Pro Nails</h2>

        <p>
          Professional nail salon located in Puyallup, Washington offering
          manicure, pedicure, acrylic, and waxing services with convenient
          online booking.
        </p>

        <div className="info-grid">
          <div className="info-card">
            <h3>Location</h3>
            <p>3819 S Meridian</p>
            <p>Puyallup, WA 98373</p>
            <p>Willows Shopping Center</p>
          </div>

          <div className="info-card">
            <h3>Contact</h3>
            <p>(253) 864-6798</p>
            <p>Accepts Credit Cards</p>
            <p>Restroom Available</p>
          </div>

          <div className="info-card">
            <h3>Hours</h3>
            <p>Mon–Sat: 9:30 AM – 7:00 PM</p>
            <p>Sunday: 10:00 AM – 5:00 PM</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>Featured Services</h2>

        <div className="service-preview-grid">
          <div className="service-preview-card">
            <h3>Manicure</h3>
            <p>Classic nail care and polish services.</p>
          </div>

          <div className="service-preview-card">
            <h3>Pedicure</h3>
            <p>Relaxing foot care and polish options.</p>
          </div>

          <div className="service-preview-card">
            <h3>Acrylics</h3>
            <p>Full sets, fills, and nail enhancements.</p>
          </div>

          <div className="service-preview-card">
            <h3>Waxing</h3>
            <p>Simple waxing services available.</p>
          </div>
        </div>
      </section>

      <section className="home-section booking-steps">
        <h2>How Online Booking Works</h2>

        <div className="steps-grid">
          <div className="step-card">
            <span>1</span>
            <h3>Select Services</h3>
            <p>Choose the nail or spa services you want.</p>
          </div>

          <div className="step-card">
            <span>2</span>
            <h3>Request Appointment</h3>
            <p>Submit your preferred date, time, and technician.</p>
          </div>

          <div className="step-card">
            <span>3</span>
            <h3>Admin Confirms</h3>
            <p>The salon reviews and approves the booking request.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
