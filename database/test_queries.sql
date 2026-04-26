-- Quick Test Queries
-- See all services in each appointment
SELECT 
    a.appointment_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    a.appointment_datetime,
    a.status,
    s.service_name,
    aps.service_price_at_booking,
    CONCAT(wr.first_name, ' ', wr.last_name) AS requested_worker,
    CONCAT(wa.first_name, ' ', wa.last_name) AS assigned_worker
FROM appointments a
JOIN customers c 
    ON a.customer_id = c.customer_id
JOIN appointment_services aps 
    ON a.appointment_id = aps.appointment_id
JOIN services s 
    ON aps.service_id = s.service_id
LEFT JOIN workers wr 
    ON aps.requested_worker_id = wr.worker_id
LEFT JOIN workers wa 
    ON aps.assigned_worker_id = wa.worker_id
ORDER BY a.appointment_datetime, a.appointment_id;

-- Most Requested Services
SELECT 
    s.service_name,
    COUNT(*) AS times_booked
FROM appointment_services aps
JOIN services s 
    ON aps.service_id = s.service_id
GROUP BY s.service_id, s.service_name
ORDER BY times_booked DESC;

-- Appointment By Status
SELECT 
    status,
    COUNT(*) AS total
FROM appointments
GROUP BY status;

-- Revenue By Completed Appointments
SELECT 
    DATE(appointment_datetime) AS appointment_day,
    SUM(total_price) AS revenue
FROM appointments
WHERE status = 'completed'
GROUP BY DATE(appointment_datetime)
ORDER BY appointment_day;