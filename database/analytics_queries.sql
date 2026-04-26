USE nailtech_db;

-- ANALYTICS QUERIES
-- Core dashboard queries for NailTech capstone

-- 1. Full Appointment Details
-- Useful for admin/staff booking table and checking joins
SELECT 
    a.appointment_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    a.appointment_datetime,
    a.status,
    s.service_name,
    s.category,
    aps.service_price_at_booking,
    aps.service_duration_at_booking,
    CASE
        WHEN aps.requested_worker_id IS NULL THEN 'No preference'
        ELSE CONCAT(wr.first_name, ' ', wr.last_name)
    END AS requested_worker,
    CASE
        WHEN aps.assigned_worker_id IS NULL THEN 'Unassigned'
        ELSE CONCAT(wa.first_name, ' ', wa.last_name)
    END AS assigned_worker
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
ORDER BY a.appointment_datetime DESC, a.appointment_id DESC;


-- 2. Most Requested Services
-- Contract-aligned: most requested services
-- Counts approved/completed bookings only
SELECT 
    s.service_id,
    s.service_name,
    s.category,
    COUNT(*) AS times_booked,
    SUM(aps.service_price_at_booking) AS total_service_revenue
FROM appointment_services aps
JOIN services s 
    ON aps.service_id = s.service_id
JOIN appointments a 
    ON aps.appointment_id = a.appointment_id
WHERE a.status IN ('approved', 'completed')
GROUP BY s.service_id, s.service_name, s.category
ORDER BY times_booked DESC, total_service_revenue DESC, s.service_name ASC;


-- 3. Busiest Days of the Week
-- Contract-aligned: busiest days
-- Uses weekday number for proper ordering
SELECT 
    WEEKDAY(a.appointment_datetime) AS day_number,
    DAYNAME(a.appointment_datetime) AS day_of_week,
    COUNT(DISTINCT a.appointment_id) AS total_appointments
FROM appointments a
WHERE a.status IN ('approved', 'completed')
GROUP BY WEEKDAY(a.appointment_datetime), DAYNAME(a.appointment_datetime)
ORDER BY day_number ASC;


-- 4. Booking Volume by Hour
-- Useful for identifying peak and least busy hours
SELECT 
    HOUR(a.appointment_datetime) AS hour_of_day,
    COUNT(DISTINCT a.appointment_id) AS total_appointments
FROM appointments a
WHERE a.status IN ('approved', 'completed')
GROUP BY HOUR(a.appointment_datetime)
ORDER BY hour_of_day ASC;


-- 5. Least Busy Time Blocks
-- Contract-aligned: least busy time slots
-- Better for dashboard summaries than raw hours
SELECT 
    CASE
        WHEN HOUR(a.appointment_datetime) BETWEEN 9 AND 11 THEN 'Morning'
        WHEN HOUR(a.appointment_datetime) BETWEEN 12 AND 16 THEN 'Afternoon'
        WHEN HOUR(a.appointment_datetime) BETWEEN 17 AND 19 THEN 'Evening'
        ELSE 'Other'
    END AS time_block,
    COUNT(DISTINCT a.appointment_id) AS total_appointments
FROM appointments a
WHERE a.status IN ('approved', 'completed')
GROUP BY 
    CASE
        WHEN HOUR(a.appointment_datetime) BETWEEN 9 AND 11 THEN 'Morning'
        WHEN HOUR(a.appointment_datetime) BETWEEN 12 AND 16 THEN 'Afternoon'
        WHEN HOUR(a.appointment_datetime) BETWEEN 17 AND 19 THEN 'Evening'
        ELSE 'Other'
    END
ORDER BY total_appointments ASC, time_block ASC;


-- 6. Worker Workload
-- Useful for staffing and dashboard management insights
-- Counts assigned services, since workers are assigned
-- at the service level
SELECT 
    w.worker_id,
    CONCAT(w.first_name, ' ', w.last_name) AS worker_name,
    COUNT(*) AS total_assigned_services,
    SUM(aps.service_price_at_booking) AS assigned_service_revenue
FROM appointment_services aps
JOIN workers w 
    ON aps.assigned_worker_id = w.worker_id
JOIN appointments a 
    ON aps.appointment_id = a.appointment_id
WHERE a.status IN ('approved', 'completed')
GROUP BY w.worker_id, CONCAT(w.first_name, ' ', w.last_name)
ORDER BY total_assigned_services DESC, assigned_service_revenue DESC;


-- EXTRA ANALYTICS QUERIES
-- Nice to have if time allows

-- 7. Requested Worker vs Assigned Worker
-- Shows which requested worker/service pairings happen most
SELECT 
    CONCAT(wr.first_name, ' ', wr.last_name) AS requested_worker,
    CONCAT(wa.first_name, ' ', wa.last_name) AS assigned_worker,
    COUNT(*) AS times
FROM appointment_services aps
LEFT JOIN workers wr 
    ON aps.requested_worker_id = wr.worker_id
LEFT JOIN workers wa 
    ON aps.assigned_worker_id = wa.worker_id
JOIN appointments a 
    ON aps.appointment_id = a.appointment_id
WHERE a.status IN ('approved', 'completed')
  AND aps.requested_worker_id IS NOT NULL
  AND aps.assigned_worker_id IS NOT NULL
GROUP BY 
    CONCAT(wr.first_name, ' ', wr.last_name),
    CONCAT(wa.first_name, ' ', wa.last_name)
ORDER BY times DESC, requested_worker ASC, assigned_worker ASC;


-- 8. Worker Request Match Rate
-- Measures how often a requested worker was actually assigned
SELECT 
    COUNT(*) AS total_with_worker_request,
    SUM(
        CASE 
            WHEN aps.requested_worker_id = aps.assigned_worker_id THEN 1
            ELSE 0
        END
    ) AS matched_requests,
    ROUND(
        100.0 * SUM(
            CASE 
                WHEN aps.requested_worker_id = aps.assigned_worker_id THEN 1
                ELSE 0
            END
        ) / COUNT(*),
        2
    ) AS match_percentage
FROM appointment_services aps
JOIN appointments a 
    ON aps.appointment_id = a.appointment_id
WHERE a.status IN ('approved', 'completed')
  AND aps.requested_worker_id IS NOT NULL
  AND aps.assigned_worker_id IS NOT NULL;


-- 9. Monthly Revenue Trend
-- Useful for longer-term business tracking
SELECT 
    DATE_FORMAT(a.appointment_datetime, '%Y-%m') AS month,
    SUM(aps.service_price_at_booking) AS monthly_revenue
FROM appointments a
JOIN appointment_services aps 
    ON a.appointment_id = aps.appointment_id
WHERE a.status IN ('approved', 'completed')
GROUP BY DATE_FORMAT(a.appointment_datetime, '%Y-%m')
ORDER BY month ASC;