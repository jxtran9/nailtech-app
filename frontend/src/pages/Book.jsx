import { useEffect, useState } from "react";
import API_BASE from "../api";
import "../styles/book.css";

// Booking page: allows users to create appointment requests
// Handles form input, loads services/workers, and sends data to backend
export default function Book() {
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Stores all user input (name, contact, services, date/time)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
    services: [
      {
        service_id: "",
        requested_worker_id: "",
      },
    ],
  });

  const categoryOrder = [
    "Manicure",
    "Pedicure",
    "Nails Enhancements",
    "Waxing",
    "Additional Services",
  ];

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }

    acc[service.category].push(service);
    return acc;
  }, {});

  Object.keys(groupedServices).forEach((category) => {
    groupedServices[category].sort((a, b) =>
      a.service_name.localeCompare(b.service_name)
    );
  });

  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  const selectedServices = formData.services
    .map((serviceRow) =>
      services.find(
        (service) => service.service_id === Number(serviceRow.service_id)
      )
    )
    .filter(Boolean);

  // Calculates total price based on selected services
  const totalPrice = selectedServices.reduce((sum, service) => {
    return sum + Number(service.price);
  }, 0);

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  // Runs when page loads to fetch services and workers from backend
  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // Fetches services and workers from FastAPI backend
  const fetchData = async () => {
    try {
      const [servicesRes, workersRes] = await Promise.all([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/workers`),
      ]);

      if (!servicesRes.ok || !workersRes.ok) {
        throw new Error("Failed to load data");
      }

      const servicesData = await servicesRes.json();
      const workersData = await workersRes.json();

      setServices(servicesData);
      setWorkers(workersData);
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage("Failed to load booking data.");
    } finally {
      setLoading(false);
    }
  };

  // Updates formData when user types in inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Updates selected service or worker for a specific service row
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  // Adds another service selection row
  const addServiceRow = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          service_id: "",
          requested_worker_id: "",
        },
      ],
    }));
  };

  // Removes a service row
  const removeServiceRow = (index) => {
    if (formData.services.length === 1) return;

    const updatedServices = formData.services.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  // Validates form and sends booking request to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const selectedDateTime = new Date(
      `${formData.appointment_date}T${formData.appointment_time}`
    );
    const now = new Date();

    if (selectedDateTime < now) {
      showMessage("Please choose a future date and time.");
      setSubmitting(false);
      return;
    }

    const hasEmptyService = formData.services.some(
      (service) => !service.service_id
    );

    if (hasEmptyService) {
      showMessage("Please select a service for each service row.");
      setSubmitting(false);
      return;
    }

    try {
      const appointmentDatetime = `${formData.appointment_date}T${formData.appointment_time}:00`;

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        appointment_datetime: appointmentDatetime,
        notes: formData.notes || null,
        services: formData.services.map((service) => ({
          service_id: Number(service.service_id),
          requested_worker_id: service.requested_worker_id
            ? Number(service.requested_worker_id)
            : null,
        })),
      };

      const res = await fetch(`${API_BASE}/booking-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData);
        throw new Error("Failed to create booking request");
      }

      await res.json();

      showMessage(
        "Your appointment request has been submitted and is now pending review."
      );

      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        appointment_date: "",
        appointment_time: "",
        notes: "",
        services: [
          {
            service_id: "",
            requested_worker_id: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error submitting appointment:", error);
      showMessage("There was an error submitting the appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  // UI: renders booking form and handles user interaction
  return (
    <main className="book-page">
      {message && <div className="toast-message">{message}</div>}

      <section className="book-card">
        <h1 className="book-title">Book an Appointment</h1>
        <p className="book-subtitle">
          Enter your information, choose one or more services, and select your
          preferred time.
        </p>

        {loading ? (
          <p>Loading booking form...</p>
        ) : (
          <form onSubmit={handleSubmit} className="book-form">
            <div className="book-two-column">
              <div className="book-field">
                <label className="book-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="book-input"
                />
              </div>

              <div className="book-field">
                <label className="book-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="book-input"
                />
              </div>
            </div>

            <div className="book-two-column">
              <div className="book-field">
                <label className="book-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="book-input"
                />
              </div>

              <div className="book-field">
                <label className="book-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="book-input"
                />
              </div>
            </div>

            <div className="book-services-section">
              <div className="book-services-header">
                <h2 className="book-section-title">Services</h2>
                <button
                  type="button"
                  onClick={addServiceRow}
                  className="book-add-button"
                >
                  + Add Service
                </button>
              </div>

              {formData.services.map((serviceRow, index) => (
                <div key={index} className="book-service-row">
                  <div className="book-field">
                    <label className="book-label">Service {index + 1}</label>
                    <select
                      value={serviceRow.service_id}
                      onChange={(e) =>
                        handleServiceChange(index, "service_id", e.target.value)
                      }
                      required
                      className="book-input"
                    >
                      <option value="">Select a service</option>

                      {sortedCategories.map((category) => (
                        <optgroup key={category} label={category}>
                          {groupedServices[category].map((service) => (
                            <option
                              key={service.service_id}
                              value={service.service_id}
                            >
                              {service.service_name} - ${service.price}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="book-field">
                    <label className="book-label">Requested Worker</label>
                    <select
                      value={serviceRow.requested_worker_id}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "requested_worker_id",
                          e.target.value
                        )
                      }
                      className="book-input"
                    >
                      <option value="">No preference</option>

                      {workers.map((worker) => (
                        <option key={worker.worker_id} value={worker.worker_id}>
                          {worker.first_name} {worker.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="book-remove-button-wrapper">
                    <button
                      type="button"
                      onClick={() => removeServiceRow(index)}
                      className="book-remove-button"
                      disabled={formData.services.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="book-total-box">
                <strong>Estimated Total:</strong> ${totalPrice.toFixed(2)}
              </div>
            </div>

            <div className="book-two-column">
              <div className="book-field">
                <label className="book-label">Appointment Date</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                  min={localToday}
                  className="book-input"
                />
              </div>

              <div className="book-field">
                <label className="book-label">Appointment Time</label>
                <input
                  type="time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                  className="book-input"
                />
              </div>
            </div>

            <div className="book-field">
              <label className="book-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="book-textarea"
                placeholder="Add any notes here..."
              />
            </div>

            <button type="submit" disabled={submitting} className="book-button">
              {submitting ? "Submitting..." : "Book Appointment"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
