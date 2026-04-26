from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Numeric,
    Boolean,
    Enum,
    func,
)
from sqlalchemy.orm import relationship
from database import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Worker(Base):
    __tablename__ = "workers"

    worker_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    role = Column(Enum("owner", "staff", name="workers_role_enum"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    category = Column(String(50), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    appointment_datetime = Column(DateTime, nullable=False)
    status = Column(
        Enum("pending", "approved", "declined", "cancelled", "completed", name="appointments_status_enum"),
        nullable=False,
        default="pending",
    )
    notes = Column(String(255), nullable=True)
    total_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    customer = relationship("Customer")
    appointment_services = relationship("AppointmentService", back_populates="appointment")


class AppointmentService(Base):
    __tablename__ = "appointment_services"

    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), primary_key=True)
    service_id = Column(Integer, ForeignKey("services.service_id"), primary_key=True)
    service_price_at_booking = Column(Numeric(10, 2), nullable=False)
    service_duration_at_booking = Column(Integer, nullable=False)
    requested_worker_id = Column(Integer, ForeignKey("workers.worker_id"), nullable=True)
    assigned_worker_id = Column(Integer, ForeignKey("workers.worker_id"), nullable=True)

    appointment = relationship("Appointment", back_populates="appointment_services")
    service = relationship("Service", foreign_keys=[service_id])
    requested_worker = relationship("Worker", foreign_keys=[requested_worker_id])
    assigned_worker = relationship("Worker", foreign_keys=[assigned_worker_id])