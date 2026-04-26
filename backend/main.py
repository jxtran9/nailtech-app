from fastapi.middleware.cors import CORSMiddleware

from decimal import Decimal
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Customer, Worker, Service, Appointment, AppointmentService
from schemas import (
    ServiceOut,
    WorkerOut,
    CustomerOut,
    AppointmentCreate,
    AppointmentOut,
    AppointmentDetailOut,
    AppointmentServiceDetail,
    BookingRequestCreate,
)

app = FastAPI(title="NailTech API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "NailTech backend is running"}


@app.get("/services", response_model=list[ServiceOut])
def get_services(db: Session = Depends(get_db)):
    return (
        db.query(Service)
        .filter(Service.is_active == True)
        .order_by(Service.category, Service.service_name)
        .all()
    )


@app.get("/workers", response_model=list[WorkerOut])
def get_workers(db: Session = Depends(get_db)):
    return (
        db.query(Worker)
        .filter(Worker.is_active == True)
        .order_by(Worker.first_name, Worker.last_name)
        .all()
    )


@app.get("/customers", response_model=list[CustomerOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.first_name, Customer.last_name).all()


@app.get("/appointments", response_model=list[AppointmentOut])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).order_by(Appointment.appointment_datetime).all()


@app.get("/appointments/{appointment_id}", response_model=AppointmentDetailOut)
def get_appointment_detail(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.customer),
            joinedload(Appointment.appointment_services).joinedload(AppointmentService.service),
        )
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    service_rows = []
    for row in appointment.appointment_services:
        service_rows.append(
            AppointmentServiceDetail(
                service_id=row.service_id,
                service_name=row.service.service_name,
                service_price_at_booking=row.service_price_at_booking,
                service_duration_at_booking=row.service_duration_at_booking,
                requested_worker_id=row.requested_worker_id,
                assigned_worker_id=row.assigned_worker_id,
            )
        )

    return AppointmentDetailOut(
        appointment_id=appointment.appointment_id,
        appointment_datetime=appointment.appointment_datetime,
        status=appointment.status,
        notes=appointment.notes,
        total_price=appointment.total_price,
        customer_name=f"{appointment.customer.first_name} {appointment.customer.last_name}",
        services=service_rows,
    )


@app.post("/appointments", response_model=AppointmentOut)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    customer = (
        db.query(Customer)
        .filter(Customer.customer_id == payload.customer_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not payload.services:
        raise HTTPException(status_code=400, detail="At least one service is required")

    seen_service_ids = set()
    total_price = Decimal("0.00")
    appointment_service_rows = []

    for item in payload.services:
        if item.service_id in seen_service_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate service_id {item.service_id} in one appointment is not allowed",
            )
        seen_service_ids.add(item.service_id)

        service = (
            db.query(Service)
            .filter(Service.service_id == item.service_id, Service.is_active == True)
            .first()
        )
        if not service:
            raise HTTPException(status_code=404, detail=f"Service {item.service_id} not found")

        if item.requested_worker_id is not None:
            worker = (
                db.query(Worker)
                .filter(
                    Worker.worker_id == item.requested_worker_id,
                    Worker.is_active == True,
                )
                .first()
            )
            if not worker:
                raise HTTPException(
                    status_code=404,
                    detail=f"Requested worker {item.requested_worker_id} not found",
                )

        total_price += Decimal(str(service.price))

        appointment_service_rows.append(
            AppointmentService(
                service_id=service.service_id,
                service_price_at_booking=service.price,
                service_duration_at_booking=service.duration_minutes,
                requested_worker_id=item.requested_worker_id,
                assigned_worker_id=None,
            )
        )

    new_appointment = Appointment(
        customer_id=payload.customer_id,
        appointment_datetime=payload.appointment_datetime,
        status="pending",
        notes=payload.notes,
        total_price=total_price,
    )

    db.add(new_appointment)
    db.flush()

    for row in appointment_service_rows:
        row.appointment_id = new_appointment.appointment_id
        db.add(row)

    db.commit()
    db.refresh(new_appointment)

    return new_appointment


@app.post("/booking-request", response_model=AppointmentOut)
def create_booking_request(payload: BookingRequestCreate, db: Session = Depends(get_db)):
    if not payload.services:
        raise HTTPException(status_code=400, detail="At least one service is required")

    existing_customer = (
        db.query(Customer)
        .filter(
            (Customer.email == payload.email) | (Customer.phone == payload.phone)
        )
        .first()
    )

    if existing_customer:
        customer = existing_customer
        customer.first_name = payload.first_name
        customer.last_name = payload.last_name
        customer.phone = payload.phone
        customer.email = payload.email
    else:
        customer = Customer(
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone=payload.phone,
            email=payload.email,
        )
        db.add(customer)
        db.flush()

    seen_service_ids = set()
    total_price = Decimal("0.00")
    appointment_service_rows = []

    for item in payload.services:
        if item.service_id in seen_service_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate service_id {item.service_id} in one appointment is not allowed",
            )
        seen_service_ids.add(item.service_id)

        service = (
            db.query(Service)
            .filter(Service.service_id == item.service_id, Service.is_active == True)
            .first()
        )
        if not service:
            raise HTTPException(status_code=404, detail=f"Service {item.service_id} not found")

        if item.requested_worker_id is not None:
            worker = (
                db.query(Worker)
                .filter(
                    Worker.worker_id == item.requested_worker_id,
                    Worker.is_active == True,
                )
                .first()
            )
            if not worker:
                raise HTTPException(
                    status_code=404,
                    detail=f"Requested worker {item.requested_worker_id} not found",
                )

        total_price += Decimal(str(service.price))

        appointment_service_rows.append(
            AppointmentService(
                service_id=service.service_id,
                service_price_at_booking=service.price,
                service_duration_at_booking=service.duration_minutes,
                requested_worker_id=item.requested_worker_id,
                assigned_worker_id=None,
            )
        )

    new_appointment = Appointment(
        customer_id=customer.customer_id,
        appointment_datetime=payload.appointment_datetime,
        status="pending",
        notes=payload.notes,
        total_price=total_price,
    )

    db.add(new_appointment)
    db.flush()

    for row in appointment_service_rows:
        row.appointment_id = new_appointment.appointment_id
        db.add(row)

    db.commit()
    db.refresh(new_appointment)

    return new_appointment

@app.post("/admin-booking", response_model=AppointmentOut)
def create_admin_booking(payload: BookingRequestCreate, db: Session = Depends(get_db)):
    if not payload.services:
        raise HTTPException(status_code=400, detail="At least one service is required")

    existing_customer = (
        db.query(Customer)
        .filter(
            (Customer.email == payload.email) | (Customer.phone == payload.phone)
        )
        .first()
    )

    if existing_customer:
        customer = existing_customer
        customer.first_name = payload.first_name
        customer.last_name = payload.last_name
        customer.phone = payload.phone
        customer.email = payload.email
    else:
        customer = Customer(
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone=payload.phone,
            email=payload.email,
        )
        db.add(customer)
        db.flush()

    seen_service_ids = set()
    total_price = Decimal("0.00")
    appointment_service_rows = []

    for item in payload.services:
        if item.service_id in seen_service_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate service_id {item.service_id} in one appointment is not allowed",
            )
        seen_service_ids.add(item.service_id)

        service = (
            db.query(Service)
            .filter(Service.service_id == item.service_id, Service.is_active == True)
            .first()
        )
        if not service:
            raise HTTPException(
                status_code=404,
                detail=f"Service {item.service_id} not found"
            )

        if item.requested_worker_id is not None:
            worker = (
                db.query(Worker)
                .filter(
                    Worker.worker_id == item.requested_worker_id,
                    Worker.is_active == True,
                )
                .first()
            )
            if not worker:
                raise HTTPException(
                    status_code=404,
                    detail=f"Requested worker {item.requested_worker_id} not found",
                )

        total_price += Decimal(str(service.price))

        appointment_service_rows.append(
            AppointmentService(
                service_id=service.service_id,
                service_price_at_booking=service.price,
                service_duration_at_booking=service.duration_minutes,
                requested_worker_id=item.requested_worker_id,
                assigned_worker_id=item.requested_worker_id,
            )
        )

    new_appointment = Appointment(
        customer_id=customer.customer_id,
        appointment_datetime=payload.appointment_datetime,
        status="approved",
        notes=payload.notes,
        total_price=total_price,
    )

    db.add(new_appointment)
    db.flush()

    for row in appointment_service_rows:
        row.appointment_id = new_appointment.appointment_id
        db.add(row)

    db.commit()
    db.refresh(new_appointment)

    return new_appointment

@app.patch("/appointments/{appointment_id}/approve", response_model=AppointmentOut)
def approve_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = "approved"
    db.commit()
    db.refresh(appointment)
    return appointment


@app.patch("/appointments/{appointment_id}/decline", response_model=AppointmentOut)
def decline_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = "declined"
    db.commit()
    db.refresh(appointment)
    return appointment


@app.patch("/appointments/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = "cancelled"
    db.commit()
    db.refresh(appointment)
    return appointment


@app.patch("/appointments/{appointment_id}/complete", response_model=AppointmentOut)
def complete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Only approved appointments can be marked as completed",
        )

    appointment.status = "completed"
    db.commit()
    db.refresh(appointment)
    return appointment