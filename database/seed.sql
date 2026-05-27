USE nailtech_db;

-- CLEAN RESET
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE appointment_services;
TRUNCATE TABLE appointments;
TRUNCATE TABLE customers;
TRUNCATE TABLE workers;
TRUNCATE TABLE services;

SET FOREIGN_KEY_CHECKS = 1;

-- SERVICES
INSERT INTO services (service_name, description, price, duration_minutes, category)
VALUES
('Basic Manicure', NULL, 25.00, 30, 'Manicure'),
('Gel Manicure', NULL, 35.00, 45, 'Manicure'),
('Deluxe Manicure', NULL, 35.00, 45, 'Manicure'),

('Basic Pedicure', NULL, 35.00, 45, 'Pedicure'),
('Deluxe Pedicure', NULL, 45.00, 60, 'Pedicure'),
('Collagen Pedicure', NULL, 55.00, 60, 'Pedicure'),
('Jelly Pedicure', NULL, 65.00, 75, 'Pedicure'),
('Organic Volcano Gold Spa Pedicure', NULL, 70.00, 75, 'Pedicure'),
('Herbal Detox Pedicure', NULL, 75.00, 75, 'Pedicure'),

('Eyebrows', NULL, 12.00, 15, 'Waxing'),
('Eyebrow Tint', NULL, 25.00, 20, 'Waxing'),
('Lip', NULL, 7.00, 10, 'Waxing'),
('Chin', NULL, 10.00, 10, 'Waxing'),
('Full Face', NULL, 30.00, 30, 'Waxing'),
('Back', NULL, 50.00, 30, 'Waxing'),
('Under Arms', NULL, 20.00, 15, 'Waxing'),
('Half Arms', NULL, 25.00, 20, 'Waxing'),
('Full Arms', NULL, 40.00, 30, 'Waxing'),
('Half Leg', NULL, 30.00, 20, 'Waxing'),
('Full Leg', NULL, 50.00, 30, 'Waxing'),
('Bikini', NULL, 35.00, 20, 'Waxing'),
('Brazilian', NULL, 50.00, 30, 'Waxing'),
('Chest', NULL, 35.00, 20, 'Waxing'),

('Acrylic Full Set', NULL, 35.00, 75, 'Nails Enhancements'),
('Acrylic Fill In', NULL, 25.00, 60, 'Nails Enhancements'),
('Ombre Nails Full Set', NULL, 65.00, 90, 'Nails Enhancements'),
('Ombre Nails Fill In', NULL, 55.00, 75, 'Nails Enhancements'),
('Gel Builder Full Set', NULL, 45.00, 75, 'Nails Enhancements'),
('Gel Builder Fill In', NULL, 35.00, 60, 'Nails Enhancements'),
('Pink & White Full Set', NULL, 50.00, 90, 'Nails Enhancements'),
('Pink & White Fill In', NULL, 35.00, 60, 'Nails Enhancements'),
('Dipping Powder', NULL, 45.00, 60, 'Nails Enhancements'),

('Add Gel Color', NULL, 15.00, 15, 'Additional Services'),
('Regular Polish Change', NULL, 15.00, 20, 'Additional Services'),
('Shellac Color', NULL, 20.00, 20, 'Additional Services'),
('Nails Take Off', NULL, 15.00, 20, 'Additional Services'),
('Nails Design', NULL, 10.00, 15, 'Additional Services'),
('French Nails', NULL, 5.00, 10, 'Additional Services');

-- WORKERS
INSERT INTO workers (first_name, last_name, phone, email, role, is_active)
VALUES
('Linh', 'Tran', '4251112222', 'linh@nailtech.com', 'owner', TRUE),
('Amy', 'Nguyen', '4252223333', 'amy@nailtech.com', 'staff', TRUE),
('Jessica', 'Le', '4253334444', 'jessica@nailtech.com', 'staff', TRUE),
('Mia', 'Pham', '4254445555', 'mia@nailtech.com', 'staff', TRUE),
('Tina', 'Vo', '4255556666', 'tina@nailtech.com', 'staff', TRUE),
('Anna', 'Dang', '4256667777', 'anna@nailtech.com', 'staff', TRUE),
('Kelly', 'Huynh', '4257778888', 'kelly@nailtech.com', 'staff', TRUE),
('Linda', 'Do', '4258889999', 'linda@nailtech.com', 'staff', TRUE);

-- CUSTOMERS
INSERT INTO customers (first_name, last_name, phone, email)
VALUES
('Sophie', 'Chen', '2061111111', 'sophie@email.com'),
('Emily', 'Nguyen', '2062222222', 'emily@email.com'),
('Olivia', 'Martinez', '2063333333', 'olivia@email.com'),
('Mia', 'Patel', '2064444444', 'mia@email.com'),
('Hannah', 'Le', '2065555555', 'hannah@email.com'),
('Ashley', 'Kim', '2066666666', 'ashley@email.com'),
('Isabella', 'Garcia', '2067777777', 'isabella@email.com'),
('Grace', 'Hoang', '2068888888', 'grace@email.com'),
('Chloe', 'Park', '2069991001', 'chloe@email.com'),
('Natalie', 'Johnson', '2069991002', 'natalie@email.com'),
('Lily', 'Huynh', '2069991003', 'lily@email.com'),
('Ava', 'Wilson', '2069991004', 'ava@email.com'),
('Madison', 'Brown', '2069991005', 'madison@email.com'),
('Ella', 'Lopez', '2069991006', 'ella@email.com'),
('Victoria', 'Mai', '2069991007', 'victoria@email.com'),
('Zoe', 'Anderson', '2069991008', 'zoe@email.com'),
('Claire', 'Luong', '2069991009', 'claire@email.com'),
('Kayla', 'Thompson', '2069991010', 'kayla@email.com'),
('Bella', 'Duong', '2069991011', 'bella@email.com'),
('Jasmine', 'Lee', '2069991012', 'jasmine@email.com'),
('Ariana', 'Phan', '2069991013', 'ariana@email.com'),
('Sydney', 'Davis', '2069991014', 'sydney@email.com'),
('Kimberly', 'Cao', '2069991015', 'kimberly@email.com'),
('Megan', 'Taylor', '2069991016', 'megan@email.com'),
('Janet', 'Banh', '2069991017', 'janet@email.com'),
('Brooke', 'Miller', '2069991018', 'brooke@email.com'),
('Rachel', 'Clark', '2069991019', 'rachel@email.com'),
('Hailey', 'Lewis', '2069991020', 'hailey@email.com'),
('Vanessa', 'Walker', '2069991021', 'vanessa@email.com'),
('Lauren', 'Hall', '2069991022', 'lauren@email.com'),
('Naomi', 'Young', '2069991023', 'naomi@email.com'),
('Gabriella', 'Allen', '2069991024', 'gabriella@email.com'),
('Maya', 'King', '2069991025', 'maya@email.com'),
('Audrey', 'Scott', '2069991026', 'audrey@email.com'),
('Brianna', 'Green', '2069991027', 'brianna@email.com'),
('Sabrina', 'Flores', '2069991028', 'sabrina@email.com');

-- APPOINTMENTS
-- More traffic on weekends, lighter weekdays
-- Past = mostly completed
-- Future = approved / pending / cancelled / declined
INSERT INTO appointments (customer_id, appointment_datetime, status, notes, total_price)
VALUES
(1, '2026-03-30 10:00:00', 'completed', 'Requested Amy', 0.00),
(2, '2026-03-31 13:00:00', 'completed', 'Lunch break appointment', 0.00),
(3, '2026-04-01 11:30:00', 'completed', 'First visit', 0.00),
(4, '2026-04-02 15:00:00', 'completed', 'Prefers quiet service', 0.00),
(5, '2026-04-03 16:30:00', 'completed', 'After work', 0.00),

(6, '2026-04-04 09:30:00', 'completed', 'Birthday weekend', 0.00),
(7, '2026-04-04 11:00:00', 'completed', 'Walk-in', 0.00),
(8, '2026-04-04 13:00:00', 'completed', 'Requested Jessica', 0.00),
(9, '2026-04-04 15:00:00', 'completed', 'Mother-daughter day', 0.00),
(10, '2026-04-05 10:00:00', 'completed', 'Sunday self-care', 0.00),
(11, '2026-04-05 12:00:00', 'completed', 'Requested Tina', 0.00),
(12, '2026-04-05 14:30:00', 'completed', 'Added design at check-in', 0.00),

(13, '2026-04-06 10:30:00', 'completed', 'Quick service', 0.00),
(14, '2026-04-07 17:00:00', 'completed', 'After class', 0.00),
(15, '2026-04-08 13:30:00', 'completed', 'Returning customer', 0.00),
(16, '2026-04-09 11:00:00', 'completed', 'Short appointment', 0.00),
(17, '2026-04-10 16:00:00', 'completed', 'Requested Kelly', 0.00),

(18, '2026-04-11 09:00:00', 'completed', 'Vacation prep', 0.00),
(19, '2026-04-11 10:30:00', 'completed', 'Requested Mia', 0.00),
(20, '2026-04-11 12:30:00', 'completed', 'Walk-in', 0.00),
(21, '2026-04-11 14:30:00', 'completed', 'Bridal shower weekend', 0.00),
(22, '2026-04-11 16:30:00', 'completed', 'Pedicure only', 0.00),
(23, '2026-04-12 10:00:00', 'completed', 'Sunday booking', 0.00),
(24, '2026-04-12 12:00:00', 'completed', 'Returning customer', 0.00),
(25, '2026-04-12 14:00:00', 'completed', 'Requested Anna', 0.00),

(26, '2026-04-13 15:30:00', 'completed', 'After work', 0.00),
(27, '2026-04-14 10:00:00', 'completed', 'Basic service', 0.00),
(28, '2026-04-15 13:00:00', 'completed', 'Requested Linh', 0.00),
(29, '2026-04-16 16:00:00', 'completed', 'Birthday set', 0.00),
(30, '2026-04-17 17:30:00', 'completed', 'Late appointment', 0.00),

(31, '2026-04-18 09:30:00', 'completed', 'Weekend rush', 0.00),
(32, '2026-04-18 11:00:00', 'completed', 'Walk-in', 0.00),
(33, '2026-04-18 13:00:00', 'completed', 'Requested Linda', 0.00),
(34, '2026-04-18 15:00:00', 'completed', 'Spa pedicure', 0.00),
(35, '2026-04-19 10:00:00', 'completed', 'Sunday rush', 0.00),
(36, '2026-04-19 12:00:00', 'completed', 'Requested Amy', 0.00),

(5, '2026-04-22 16:00:00', 'approved', 'Returning customer', 0.00),
(12, '2026-04-23 11:30:00', 'pending', 'Prefers midday', 0.00),
(8, '2026-04-24 15:30:00', 'approved', 'Requested Jessica', 0.00),

(18, '2026-04-25 09:30:00', 'approved', 'Weekend booking', 0.00),
(2, '2026-04-25 11:00:00', 'approved', 'Requested Amy', 0.00),
(27, '2026-04-25 13:00:00', 'pending', 'May add nail design', 0.00),
(31, '2026-04-25 15:00:00', 'cancelled', 'Client cancelled same day', 0.00),

(9, '2026-04-26 10:00:00', 'approved', 'Sunday booking', 0.00),
(14, '2026-04-26 12:00:00', 'approved', 'Pedicure with gel color', 0.00),
(22, '2026-04-26 14:30:00', 'declined', 'Requested time unavailable', 0.00),

(1, '2026-04-28 17:00:00', 'pending', 'After work', 0.00),
(24, '2026-05-02 10:00:00', 'approved', 'Graduation weekend prep', 0.00);

-- APPOINTMENT SERVICES
-- requested_worker_id and assigned_worker_id use worker IDs 1-8
INSERT INTO appointment_services
(appointment_id, service_id, service_price_at_booking, service_duration_at_booking, requested_worker_id, assigned_worker_id)
VALUES
(1, 2, 35, 45, 2, 2),
(1, 37, 10, 15, NULL, 2),

(2, 4, 35, 45, NULL, 3),

(3, 1, 25, 30, NULL, 6),
(3, 10, 12, 15, NULL, 6),

(4, 32, 45, 60, 5, 5),

(5, 5, 45, 60, NULL, 4),

(6, 8, 70, 75, NULL, 1),
(6, 33, 15, 15, NULL, 1),

(7, 4, 35, 45, NULL, 2),

(8, 24, 35, 75, 3, 3),
(8, 37, 10, 15, NULL, 3),

(9, 6, 55, 60, NULL, 7),

(10, 5, 45, 60, NULL, 8),
(10, 35, 20, 20, NULL, 8),

(11, 2, 35, 45, 5, 5),

(12, 28, 45, 75, NULL, 4),
(12, 37, 10, 15, NULL, 4),

(13, 10, 12, 15, NULL, 6),
(13, 12, 7, 10, NULL, 6),

(14, 3, 35, 45, NULL, 2),

(15, 7, 65, 75, NULL, 7),

(16, 34, 15, 20, NULL, 3),

(17, 5, 45, 60, 7, 7),
(17, 33, 15, 15, NULL, 7),

(18, 30, 50, 90, NULL, 4),
(18, 37, 10, 15, NULL, 4),

(19, 32, 45, 60, 4, 4),

(20, 4, 35, 45, NULL, 5),
(20, 38, 5, 10, NULL, 5),

(21, 24, 35, 75, NULL, 2),
(21, 33, 15, 15, NULL, 2),

(22, 9, 75, 75, NULL, 8),

(23, 6, 55, 60, NULL, 6),

(24, 25, 25, 60, NULL, 3),
(24, 35, 20, 20, NULL, 3),

(25, 2, 35, 45, 6, 6),
(25, 37, 10, 15, NULL, 6),

(26, 4, 35, 45, NULL, 7),

(27, 1, 25, 30, NULL, 5),

(28, 5, 45, 60, 1, 1),
(28, 10, 12, 15, NULL, 1),

(29, 26, 65, 90, NULL, 8),
(29, 37, 10, 15, NULL, 8),

(30, 20, 50, 30, NULL, 4),

(31, 8, 70, 75, NULL, 2),

(32, 4, 35, 45, NULL, 3),

(33, 29, 35, 60, 8, 8),
(33, 38, 5, 10, NULL, 8),

(34, 9, 75, 75, NULL, 5),

(35, 32, 45, 60, NULL, 6),
(35, 37, 10, 15, NULL, 6),

(36, 5, 45, 60, 2, 2),
(36, 33, 15, 15, NULL, 2),

(37, 7, 65, 75, NULL, 7),

(38, 2, 35, 45, NULL, NULL),

(39, 28, 45, 75, 3, 3),
(39, 37, 10, 15, NULL, 3),

(40, 6, 55, 60, NULL, 4),

(41, 5, 45, 60, 2, 2),
(41, 33, 15, 15, NULL, 2),

(42, 24, 35, 75, NULL, NULL),
(42, 37, 10, 15, NULL, NULL),

(43, 4, 35, 45, NULL, NULL),

(44, 9, 75, 75, NULL, 8),

(45, 5, 45, 60, NULL, 6),
(45, 33, 15, 15, NULL, 6),

(46, 30, 50, 90, 1, NULL),

(47, 3, 35, 45, NULL, NULL),

(48, 8, 70, 75, 5, 5),
(48, 35, 20, 20, NULL, 5);


-- =========================
-- ADDITIONAL DEMO CUSTOMERS
-- Extends the dataset for stronger analytics demos
-- =========================
INSERT INTO customers (first_name, last_name, phone, email)
VALUES
('Tiffany', 'Nguyen', '2069991029', 'tiffany@email.com'),
('Michelle', 'Tran', '2069991030', 'michelle@email.com'),
('Cindy', 'Pham', '2069991031', 'cindy@email.com'),
('Diana', 'Vo', '2069991032', 'diana@email.com'),
('Kaitlyn', 'Reed', '2069991033', 'kaitlyn@email.com'),
('Sarah', 'Lam', '2069991034', 'sarah@email.com'),
('Monica', 'Chen', '2069991035', 'monica@email.com'),
('Julie', 'Park', '2069991036', 'julie@email.com');

-- =========================
-- ADDITIONAL DEMO APPOINTMENTS
-- Adds May and June data for analytics, repeat customers, and workflow examples
-- =========================
INSERT INTO appointments (customer_id, appointment_datetime, status, notes, total_price)
VALUES
(37, '2026-05-03 10:00:00', 'completed', 'Weekend gel manicure', 0.00),
(38, '2026-05-03 12:00:00', 'completed', 'Pedicure before vacation', 0.00),
(39, '2026-05-03 14:30:00', 'completed', 'Requested nail design', 0.00),
(40, '2026-05-04 11:00:00', 'completed', 'Quick waxing service', 0.00),
(1,  '2026-05-05 16:00:00', 'completed', 'Returning customer', 0.00),
(6,  '2026-05-06 13:30:00', 'completed', 'Requested gel color', 0.00),
(15, '2026-05-07 15:00:00', 'completed', 'Pedicure appointment', 0.00),
(21, '2026-05-08 17:00:00', 'completed', 'After work appointment', 0.00),

(41, '2026-05-09 09:30:00', 'completed', 'Saturday morning booking', 0.00),
(42, '2026-05-09 11:30:00', 'completed', 'Full set with design', 0.00),
(43, '2026-05-09 13:30:00', 'completed', 'Spa pedicure', 0.00),
(44, '2026-05-09 15:30:00', 'completed', 'Requested Anna', 0.00),
(24, '2026-05-10 10:00:00', 'completed', 'Returning customer', 0.00),
(27, '2026-05-10 12:00:00', 'completed', 'Basic manicure', 0.00),
(31, '2026-05-10 14:00:00', 'completed', 'Weekend pedicure', 0.00),

(37, '2026-05-14 16:30:00', 'completed', 'Returning customer fill in', 0.00),
(38, '2026-05-15 13:00:00', 'completed', 'Lunch appointment', 0.00),
(8,  '2026-05-16 10:00:00', 'completed', 'Requested Jessica again', 0.00),
(12, '2026-05-16 12:30:00', 'completed', 'Nail design add-on', 0.00),
(18, '2026-05-17 11:00:00', 'completed', 'Sunday appointment', 0.00),

(39, '2026-06-01 15:00:00', 'approved', 'Upcoming approved appointment', 0.00),
(40, '2026-06-02 14:00:00', 'pending', 'Requested afternoon time', 0.00),
(41, '2026-06-03 16:00:00', 'pending', 'Waiting for confirmation', 0.00),
(42, '2026-06-06 10:30:00', 'approved', 'Weekend approved booking', 0.00),
(43, '2026-06-06 13:00:00', 'cancelled', 'Customer schedule conflict', 0.00),
(44, '2026-06-07 11:00:00', 'declined', 'Technician unavailable', 0.00),

(1,  '2026-06-08 10:00:00', 'pending', 'Future repeat customer request', 0.00),
(6,  '2026-06-09 15:30:00', 'approved', 'Future approved booking', 0.00),
(24, '2026-06-12 17:00:00', 'pending', 'Requested evening slot', 0.00),
(31, '2026-06-13 12:00:00', 'approved', 'Future weekend booking', 0.00);

-- =========================
-- ADDITIONAL APPOINTMENT SERVICES
-- Matches appointment IDs 49-78 from the additional demo appointments above
-- =========================
INSERT INTO appointment_services
(appointment_id, service_id, service_price_at_booking, service_duration_at_booking, requested_worker_id, assigned_worker_id)
VALUES
(49, 2, 35, 45, 2, 2),
(50, 7, 65, 75, NULL, 5),
(51, 24, 35, 75, NULL, 3),
(51, 37, 10, 15, NULL, 3),
(52, 10, 12, 15, NULL, 6),
(52, 12, 7, 10, NULL, 6),
(53, 2, 35, 45, 2, 2),
(53, 37, 10, 15, NULL, 2),
(54, 1, 25, 30, NULL, 4),
(54, 33, 15, 15, NULL, 4),
(55, 5, 45, 60, NULL, 7),
(56, 6, 55, 60, NULL, 8),

(57, 2, 35, 45, NULL, 2),
(58, 26, 65, 90, NULL, 3),
(58, 37, 10, 15, NULL, 3),
(59, 8, 70, 75, NULL, 5),
(60, 32, 45, 60, 6, 6),
(61, 25, 25, 60, NULL, 4),
(62, 1, 25, 30, NULL, 7),
(63, 4, 35, 45, NULL, 8),

(64, 29, 35, 60, 8, 8),
(65, 4, 35, 45, NULL, 3),
(66, 24, 35, 75, 3, 3),
(66, 37, 10, 15, NULL, 3),
(67, 28, 45, 75, 3, 3),
(67, 37, 10, 15, NULL, 3),
(68, 5, 45, 60, NULL, 5),

(69, 32, 45, 60, NULL, NULL),
(70, 4, 35, 45, NULL, NULL),
(71, 2, 35, 45, 2, NULL),
(72, 30, 50, 90, NULL, 6),
(73, 9, 75, 75, NULL, NULL),
(74, 24, 35, 75, 6, NULL),

(75, 2, 35, 45, NULL, NULL),
(76, 7, 65, 75, NULL, 5),
(77, 6, 55, 60, NULL, NULL),
(78, 8, 70, 75, NULL, 8);

-- UPDATE TOTAL PRICE
SET SQL_SAFE_UPDATES = 0;

UPDATE appointments a
JOIN (
    SELECT appointment_id, SUM(service_price_at_booking) AS total
    FROM appointment_services
    GROUP BY appointment_id
) x
ON a.appointment_id = x.appointment_id
SET a.total_price = x.total;

SET SQL_SAFE_UPDATES = 1;

-- OPTIONAL CHECKS
SELECT COUNT(*) AS total_services FROM services;
SELECT COUNT(*) AS total_workers FROM workers;
SELECT COUNT(*) AS total_customers FROM customers;
SELECT COUNT(*) AS total_appointments FROM appointments;
SELECT COUNT(*) AS total_appointment_services FROM appointment_services;

SELECT status, COUNT(*) AS count_per_status
FROM appointments
GROUP BY status
ORDER BY count_per_status DESC;

SELECT DATE(appointment_datetime) AS appt_date, COUNT(*) AS daily_bookings
FROM appointments
GROUP BY DATE(appointment_datetime)
ORDER BY appt_date;