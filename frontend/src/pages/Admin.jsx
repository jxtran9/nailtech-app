import { useEffect, useState } from "react";

export default function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [customers, setCustomers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [appointmentsRes, customersRes, workersRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/appointments"),
        fetch("http://127.0.0.1:8000/customers"),
        fetch("http://127.0.0.1:8000/workers"),
      ]);

      if (!appointmentsRes.ok || !customersRes.ok || !workersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const appointmentsData = await appointmentsRes.json();
      const customersData = await customersRes.json();
      const workersData = await workersRes.json();

      setCustomers(customersData);
      setWorkers(workersData);

      const sortedAppointments = [...appointmentsData].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return new Date(b.appointment_datetime) - new Date(a.appointment_datetime);
      });

      setAppointments(sortedAppointments);

      const detailResults = await Promise.all(
        sortedAppointments.map(async (appointment) => {
          const res = await fetch(
            `http://127.0.0.1:8000/appointments/${appointment.appointment_id}`
          );

          if (!res.ok) {
            throw new Error(
              `Failed to fetch details for appointment ${appointment.appointment_id}`
            );
          }

          const detail = await res.json();
          return {
            appointment_id: appointment.appointment_id,
            detail,
          };
        })
      );

      const detailsMap = {};
      detailResults.forEach((item) => {
        detailsMap[item.appointment_id] = item.detail;
      });

      setAppointmentDetails(detailsMap);
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, action) => {
    try {
      setMessage("");

      const res = await fetch(
        `http://127.0.0.1:8000/appointments/${appointmentId}/${action}`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to ${action} appointment`);
      }

      const appointment = appointments.find(
        (appt) => appt.appointment_id === appointmentId
      );

      const customerEmail = appointment
        ? getCustomerEmail(appointment.customer_id)
        : null;

        let newMessage = "";

        if (action === "approve" && customerEmail && customerEmail !== "—") {
          newMessage = `Appointment approved successfully. Confirmation email sent to ${customerEmail}.`;
        } else if (action === "decline") {
          newMessage =
            "Appointment declined. The requested time is unavailable. Please ask the customer to submit a new request or contact the salon to reschedule.";
        } else if (action === "cancel") {
          newMessage = "Appointment cancelled successfully.";
        } else if (action === "complete") {
          newMessage = "Appointment completed successfully.";
        } else {
          newMessage = "Appointment updated successfully.";
        }
        
        setMessage(newMessage);
        
        setTimeout(() => {
          setMessage("");
        }, 3000);

      fetchData();
    } catch (error) {
      console.error(`Error trying to ${action} appointment:`, error);
      setMessage(`Failed to ${action} appointment.`);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getCustomer = (customerId) => {
    return customers.find((customer) => customer.customer_id === customerId);
  };

  const getCustomerName = (appointment) => {
    const detail = appointmentDetails[appointment.appointment_id];
    if (detail?.customer_name) return detail.customer_name;

    const customer = getCustomer(appointment.customer_id);
    if (customer) return `${customer.first_name} ${customer.last_name}`;

    return "Unknown";
  };

  const getCustomerPhone = (customerId) => {
    const customer = getCustomer(customerId);
    return customer?.phone || "—";
  };

  const getCustomerEmail = (customerId) => {
    const customer = getCustomer(customerId);
    return customer?.email || "—";
  };

  const getWorkerName = (workerId) => {
    if (!workerId) return "No preference";

    const worker = workers.find((w) => w.worker_id === workerId);
    return worker ? `${worker.first_name} ${worker.last_name}` : "Unknown worker";
  };

  const getServiceDetails = (appointmentId) => {
    const detail = appointmentDetails[appointmentId];
    if (!detail?.services || detail.services.length === 0) return [];

    return detail.services.map((service) => ({
      service_name: service.service_name,
      requested_worker: getWorkerName(service.requested_worker_id),
    }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Manage appointment requests and statuses.</p>

        {message && <div style={styles.toast}>{message}</div>}

        <button style={styles.refreshButton} onClick={fetchData}>
          Refresh Appointments
        </button>

        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Services / Requested Worker</th>
                  <th style={styles.th}>Date & Time</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const serviceDetails = getServiceDetails(appointment.appointment_id);

                  return (
                    <tr key={appointment.appointment_id}>
                      <td style={styles.td}>{appointment.appointment_id}</td>
                      <td style={styles.td}>{getCustomerName(appointment)}</td>
                      <td style={styles.td}>
                        {getCustomerPhone(appointment.customer_id)}
                      </td>
                      <td style={styles.td}>
                        {getCustomerEmail(appointment.customer_id)}
                      </td>
                      <td style={styles.td}>
                        {serviceDetails.length === 0 ? (
                          "—"
                        ) : (
                          <ul style={styles.serviceList}>
                            {serviceDetails.map((service, index) => (
                              <li key={index} style={styles.serviceItem}>
                                <div>{service.service_name}</div>
                                <div style={styles.workerText}>
                                  Requested: {service.requested_worker}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td style={styles.td}>
                        {formatDateTime(appointment.appointment_datetime)}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(appointment.status),
                          }}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td style={styles.td}>{appointment.notes || "—"}</td>
                      <td style={styles.td}>
                        <div style={styles.buttonGroup}>
                          <button
                            style={styles.approveButton}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.appointment_id,
                                "approve"
                              )
                            }
                          >
                            Approve
                          </button>

                          <button
                            style={styles.declineButton}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.appointment_id,
                                "decline"
                              )
                            }
                          >
                            Decline
                          </button>

                          <button
                            style={styles.cancelButton}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.appointment_id,
                                "cancel"
                              )
                            }
                          >
                            Cancel
                          </button>

                          <button
                            style={styles.completeButton}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.appointment_id,
                                "complete"
                              )
                            }
                          >
                            Complete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "pending":
      return {
        backgroundColor: "#fff3cd",
        color: "#856404",
      };
    case "approved":
      return {
        backgroundColor: "#d4edda",
        color: "#155724",
      };
    case "declined":
      return {
        backgroundColor: "#f8d7da",
        color: "#721c24",
      };
    case "cancelled":
      return {
        backgroundColor: "#e2e3e5",
        color: "#383d41",
      };
    case "completed":
      return {
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
      };
    default:
      return {
        backgroundColor: "#f0f0f0",
        color: "#333",
      };
  }
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8f5f2",
    padding: "2rem",
  },
  card: {
    maxWidth: "1450px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "1.5rem",
  },
  message: {
    textAlign: "center",
    marginBottom: "1rem",
    fontWeight: "600",
    color: "#7a4b2f",
  },
  refreshButton: {
    padding: "0.6rem 1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#b57b5b",
    color: "#fff",
    fontWeight: "600",
    marginBottom: "1rem",
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
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#f3f3f3",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
  },
  statusBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "0.9rem",
    fontWeight: "600",
    display: "inline-block",
    textTransform: "capitalize",
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  approveButton: {
    padding: "0.5rem 0.75rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#d4edda",
    color: "#155724",
    fontWeight: "600",
  },
  declineButton: {
    padding: "0.5rem 0.75rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    fontWeight: "600",
  },
  cancelButton: {
    padding: "0.5rem 0.75rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#e2e3e5",
    color: "#383d41",
    fontWeight: "600",
  },
  completeButton: {
    padding: "0.5rem 0.75rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#d1ecf1",
    color: "#0c5460",
    fontWeight: "600",
  },
  serviceList: {
    margin: 0,
    paddingLeft: "18px",
  },
  serviceItem: {
    marginBottom: "0.5rem",
  },
  workerText: {
    fontSize: "0.9rem",
    color: "#666",
  },
};