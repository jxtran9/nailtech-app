DROP DATABASE nailtech_db;

CREATE DATABASE IF NOT EXISTS nailtech_db;
USE nailtech_db;

-- Customers
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_email (email)
);

-- Workers
CREATE TABLE workers (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    role ENUM('owner', 'staff') NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_workers_email (email)
);

-- Services
CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_services_price
        CHECK (price >= 0),
    CONSTRAINT chk_services_duration
        CHECK (duration_minutes > 0)
);

-- Appointments
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    status ENUM('pending', 'approved', 'declined', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    notes VARCHAR(255),
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointments_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_appointments_total_price
        CHECK (total_price >= 0),

    INDEX idx_appointments_customer (customer_id),
    INDEX idx_appointments_datetime (appointment_datetime),
    INDEX idx_appointments_status (status)
);

-- Appointment Services
-- Each row = one service in one appointment
CREATE TABLE appointment_services (
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    service_price_at_booking DECIMAL(10,2) NOT NULL,
    service_duration_at_booking INT NOT NULL,
    requested_worker_id INT NULL,
    assigned_worker_id INT NULL,

    PRIMARY KEY (appointment_id, service_id),

    CONSTRAINT fk_appt_services_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_appt_services_service
        FOREIGN KEY (service_id)
        REFERENCES services(service_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_appt_services_requested_worker
        FOREIGN KEY (requested_worker_id)
        REFERENCES workers(worker_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_appt_services_assigned_worker
        FOREIGN KEY (assigned_worker_id)
        REFERENCES workers(worker_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_appt_services_price
        CHECK (service_price_at_booking >= 0),

    CONSTRAINT chk_appt_services_duration
        CHECK (service_duration_at_booking > 0),

    INDEX idx_appt_services_service (service_id),
    INDEX idx_appt_services_requested_worker (requested_worker_id),
    INDEX idx_appt_services_assigned_worker (assigned_worker_id)
);