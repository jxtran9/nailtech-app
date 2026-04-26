from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class ServiceOut(BaseModel):
    service_id: int
    service_name: str
    description: Optional[str] = None
    price: Decimal
    duration_minutes: int
    category: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class WorkerOut(BaseModel):
    worker_id: int
    first_name: str
    last_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class CustomerOut(BaseModel):
    customer_id: int
    first_name: str
    last_name: str
    phone: str
    email: str

    class Config:
        from_attributes = True


class AppointmentServiceCreate(BaseModel):
    service_id: int
    requested_worker_id: Optional[int] = None


class AppointmentCreate(BaseModel):
    customer_id: int
    appointment_datetime: datetime
    notes: Optional[str] = None
    services: List[AppointmentServiceCreate]


class AppointmentOut(BaseModel):
    appointment_id: int
    customer_id: int
    appointment_datetime: datetime
    status: str
    notes: Optional[str] = None
    total_price: Decimal

    class Config:
        from_attributes = True


class AppointmentServiceDetail(BaseModel):
    service_id: int
    service_name: str
    service_price_at_booking: Decimal
    service_duration_at_booking: int
    requested_worker_id: Optional[int] = None
    assigned_worker_id: Optional[int] = None


class AppointmentDetailOut(BaseModel):
    appointment_id: int
    appointment_datetime: datetime
    status: str
    notes: Optional[str] = None
    total_price: Decimal
    customer_name: str
    services: List[AppointmentServiceDetail]


class BookingServiceCreate(BaseModel):
    service_id: int
    requested_worker_id: Optional[int] = None


class BookingRequestCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    appointment_datetime: datetime
    notes: Optional[str] = None
    services: List[BookingServiceCreate]