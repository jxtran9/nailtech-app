import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE from "../api";
import "../styles/admin.css";

// Admin dashboard page for staff to view and manage appointment requests
// Loads appointment, customer, and worker data from backend
// Allows staff to approve, decline, cancel, or complete appointments
export default function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [customers, setCustomers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [appointmentsRes, customersRes, workersRes] = await Promise.all([
        fetch(`${API_BASE}/appointments`),
        fetch(`${API_BASE}/customers`),
        fetch(`${API_BASE}/workers`),
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
        return (
          new Date(b.appointment_datetime) - new Date(a.appointment_datetime)
        );
      });

      setAppointments(sortedAppointments);

      const detailResults = await Promise.all(
        sortedAppointments.map(async (appointment) => {
          try {
            const res = await fetch(
              `${API_BASE}/appointments/${appointment.appointment_id}`
            );

            if (!res.ok) {
              console.error(
                `Failed to fetch details for appointment ${appointment.appointment_id}`
              );
              return null;
            }

            const detail = await res.json();

            return {
              appointment_id: appointment.appointment_id,
              detail,
            };
          } catch (error) {
            console.error(
              `Error fetching details for appointment ${appointment.appointment_id}:`,
              error
            );
            return null;
          }
        })
      );

      const detailsMap = {};
      detailResults.filter(Boolean).forEach((item) => {
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
        `${API_BASE}/appointments/${appointmentId}/${action}`,
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
    return worker
      ? `${worker.first_name} ${worker.last_name}`
      : "Unknown worker";
  };

  const getServiceDetails = (appointmentId) => {
    const detail = appointmentDetails[appointmentId];
    if (!detail?.services || detail.services.length === 0) return [];

    return detail.services.map((service) => ({
      service_name: service.service_name,
      requested_worker: getWorkerName(service.requested_worker_id),
    }));
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const customerName = getCustomerName(appointment).toLowerCase();
    const phone = getCustomerPhone(appointment.customer_id).toLowerCase();
    const email = getCustomerEmail(appointment.customer_id).toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      customerName.includes(search) ||
      phone.includes(search) ||
      email.includes(search) ||
      String(appointment.appointment_id).includes(search);

    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;

    const appointmentDate = appointment.appointment_datetime.split("T")[0];
    const matchesDate = dateFilter === "" || appointmentDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <main className="admin-page">
      <section className="admin-card">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">
          Manage appointment requests and statuses.
        </p>

        <div className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/add-booking">Add Booking</Link>
          <Link to="/admin/analytics">Analytics</Link>
        </div>

        {message && <div className="toast-message">{message}</div>}

        <button className="admin-refresh-button" onClick={fetchData}>
          Refresh Appointments
        </button>

        <div className="admin-filter-box">
          <input
            type="text"
            placeholder="Search by name, phone, email, or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-filter-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-input"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="admin-filter-input"
          />

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setDateFilter("");
            }}
            className="admin-clear-button"
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <p>Loading appointments...</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Services / Requested Worker</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => {
                  const serviceDetails = getServiceDetails(
                    appointment.appointment_id
                  );

                  return (
                    <tr key={appointment.appointment_id}>
                      <td>{appointment.appointment_id}</td>
                      <td>{getCustomerName(appointment)}</td>
                      <td>{getCustomerPhone(appointment.customer_id)}</td>
                      <td>{getCustomerEmail(appointment.customer_id)}</td>
                      <td>
                        {serviceDetails.length === 0 ? (
                          "—"
                        ) : (
                          <ul className="admin-service-list">
                            {serviceDetails.map((service, index) => (
                              <li key={index} className="admin-service-item">
                                <div>{service.service_name}</div>
                                <div className="admin-worker-text">
                                  Requested: {service.requested_worker}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td>
                        {formatDateTime(appointment.appointment_datetime)}
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${appointment.status}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td>{appointment.notes || "—"}</td>
                      <td>
                        <div className="admin-button-group">
                          <button
                            className="approve-button"
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
                            className="decline-button"
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
                            className="cancel-button"
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
                            className="complete-button"
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
      </section>
    </main>
  );
}
