import { useEffect, useState } from "react";

export default function Book() {
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

      const res = await fetch("http://127.0.0.1:8000/booking-request", {
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

  return (
    <div style={styles.page}>
      {message && <div style={styles.toast}>{message}</div>}

      <div style={styles.card}>
        <h1 style={styles.title}>Book an Appointment</h1>
        <p style={styles.subtitle}>
          Enter your information, choose one or more services, and select your
          preferred time.
        </p>

        {loading ? (
          <p>Loading booking form...</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.servicesSection}>
              <div style={styles.servicesHeader}>
                <h2 style={styles.sectionTitle}>Services</h2>
                <button
                  type="button"
                  onClick={addServiceRow}
                  style={styles.addButton}
                >
                  + Add Service
                </button>
              </div>

              {formData.services.map((serviceRow, index) => (
                <div key={index} style={styles.serviceRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Service {index + 1}</label>
                    <select
                      value={serviceRow.service_id}
                      onChange={(e) =>
                        handleServiceChange(index, "service_id", e.target.value)
                      }
                      required
                      style={styles.input}
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

                  <div style={styles.field}>
                    <label style={styles.label}>Requested Worker</label>
                    <select
                      value={serviceRow.requested_worker_id}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "requested_worker_id",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    >
                      <option value="">No preference</option>
                      {workers.map((worker) => (
                        <option key={worker.worker_id} value={worker.worker_id}>
                          {worker.first_name} {worker.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.removeButtonWrapper}>
                    <button
                      type="button"
                      onClick={() => removeServiceRow(index)}
                      style={styles.removeButton}
                      disabled={formData.services.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div style={styles.totalBox}>
                <strong>Estimated Total:</strong> ${totalPrice.toFixed(2)}
              </div>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>Appointment Date</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                  min={localToday}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Appointment Time</label>
                <input
                  type="time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                style={styles.textarea}
                placeholder="Add any notes here..."
              />
            </div>

            <button type="submit" disabled={submitting} style={styles.button}>
              {submitting ? "Submitting..." : "Book Appointment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8f5f2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "850px",
  },
  title: {
    marginBottom: "0.5rem",
    fontSize: "2rem",
    textAlign: "center",
  },
  subtitle: {
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#666",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "0.4rem",
    fontWeight: "600",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  textarea: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    resize: "vertical",
  },
  button: {
    padding: "0.9rem",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#b57b5b",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  servicesSection: {
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1rem",
    backgroundColor: "#faf8f6",
  },
  servicesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.2rem",
  },
  serviceRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "1rem",
    alignItems: "end",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e8e8e8",
  },
  totalBox: {
    padding: "0.9rem",
    borderRadius: "10px",
    backgroundColor: "#fff",
    border: "1px solid #e5d6cd",
    fontWeight: "600",
    textAlign: "right",
    color: "#333",
  },
  addButton: {
    padding: "0.6rem 0.9rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#d1ecf1",
    color: "#0c5460",
    fontWeight: "600",
    cursor: "pointer",
  },
  removeButtonWrapper: {
    display: "flex",
    alignItems: "end",
  },
  removeButton: {
    padding: "0.75rem 0.9rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    fontWeight: "600",
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#333",
    color: "#fff",
    padding: "1rem 1.5rem",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    zIndex: 1000,
    fontWeight: "600",
    maxWidth: "500px",
    textAlign: "center",
  },
};