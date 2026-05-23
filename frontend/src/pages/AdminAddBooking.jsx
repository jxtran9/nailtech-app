import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/book.css";

export default function AdminAddBooking() {
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const totalPrice = selectedServices.reduce((sum, service) => {
    return sum + Number(service.price);
  }, 0);

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const fetchData = async () => {
    try {
      const [servicesRes, workersRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/services"),
        fetch("http://127.0.0.1:8000/workers"),
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

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

  const removeServiceRow = (index) => {
    if (formData.services.length === 1) return;

    const updatedServices = formData.services.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

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

      const res = await fetch("http://127.0.0.1:8000/admin-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData);
        throw new Error("Failed to create booking");
      }

      await res.json();

      showMessage("Booking successfully created.");

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

  return (
    <main className="book-page">
      {message && <div className="toast-message">{message}</div>}

      <section className="book-card">
        <h1 className="book-title">Add Booking (Staff)</h1>

        <p className="book-subtitle">
          Create an appointment directly for walk-ins, phone calls, or
          staff-entered bookings.
        </p>

        <div className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/add-booking">Add Booking</Link>
          <Link to="/admin/analytics">Analytics</Link>
        </div>

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
                    <label className="book-label">Assigned Worker</label>

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
              {submitting ? "Saving..." : "Create Booking"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
