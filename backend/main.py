# Main FastAPI backend file for NailTech
# Defines API routes for services, workers, bookings, appointments, and admin actions
# Handles customer creation/reuse and appointment workflow (pending -> approved/declined/cancelled -> completed)

from fastapi.middleware.cors import CORSMiddleware

from decimal import Decimal
from datetime import datetime, timedelta
from email_utils import send_email
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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "NailTech backend is running"}

# Applies optional date filtering to analytics queries
def apply_days_filter(query, days):
    if days is not None:
        start_date = datetime.now() - timedelta(days=days)
        query = query.filter(Appointment.appointment_datetime >= start_date)

    return query

# Returns all active services for the Services page and booking form
@app.get("/services", response_model=list[ServiceOut])
def get_services(db: Session = Depends(get_db)):
    return (
        db.query(Service)
        .filter(Service.is_active == True)
        .order_by(Service.category, Service.service_name)
        .all()
    )


# Returns all active workers for the requested worker dropdown
@app.get("/workers", response_model=list[WorkerOut])
def get_workers(db: Session = Depends(get_db)):
    return (
        db.query(Worker)
        .filter(Worker.is_active == True)
        .order_by(Worker.first_name, Worker.last_name)
        .all()
    )


# Returns all customers stored in the database
@app.get("/customers", response_model=list[CustomerOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.first_name, Customer.last_name).all()


# Return all appointments for the admin page
@app.get("/appointments", response_model=list[AppointmentOut])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).order_by(Appointment.appointment_datetime).all()


# Returns detailed information for one appointment, including customer and selected services
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


# Creates a customer booking request from the public booking form
# Reuses an existing customer by email or phone, or creates a new customer
# Creates a new appointment with "pending" status
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
    service_names = []

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
        
        service_names.append(service.service_name)

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
    services_text = "\n".join(f"- {name}" for name in service_names)

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

    send_email(
    to_email=customer.email,
    subject="NailTech Booking Request Received",
    body=f"""Hi {customer.first_name},

Thank you for submitting your booking request.

Appointment Date/Time:
{new_appointment.appointment_datetime}

Services:
{services_text}

Your request is currently pending approval. We will contact you once it has been reviewed.

Thank you,
NailTech
"""
)

    return new_appointment

# Creates a booking directly from the admin side
# Admin-created bookings are saved as "approved" instead of "pending"
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
    service_names = []

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
        
        service_names.append(service.service_name)

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
    services_text = "\n".join(f"- {name}" for name in service_names)

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

    send_email(
        to_email=customer.email,
        subject="NailTech Appointment Scheduled",
        body=f"""Hi {customer.first_name},

Your appointment has been scheduled.

Appointment Date/Time:
{new_appointment.appointment_datetime}

Services:
{services_text}

We look forward to seeing you.

Thank you,
NailTech
"""
)

    return new_appointment

# Updates an appointment status to approved
@app.patch("/appointments/{appointment_id}/approve", response_model=AppointmentOut)
def approve_appointment(appointment_id: int, db: Session = Depends(get_db)):
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

    appointment.status = "approved"
    db.commit()
    db.refresh(appointment)

    service_names = []

    for row in appointment.appointment_services:
        service_names.append(row.service.service_name)

    services_text = "\n".join(f"- {name}" for name in service_names)

    send_email(
        to_email=appointment.customer.email,
        subject="NailTech Appointment Approved",
        body=f"""Hi {appointment.customer.first_name},

Your appointment has been approved.

Appointment Date/Time:
{appointment.appointment_datetime}

Services:
{services_text}

We look forward to seeing you.

Thank you,
NailTech
"""
)

    return appointment


# Updates an appointment status to declined
@app.patch("/appointments/{appointment_id}/decline", response_model=AppointmentOut)
def decline_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.customer))
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = "declined"
    db.commit()
    db.refresh(appointment)

    send_email(
        to_email=appointment.customer.email,
        subject="NailTech Appointment Request Declined",
        body=f"""Hi {appointment.customer.first_name},

    Unfortunately, your appointment request could not be approved.

    Requested Date/Time:
    {appointment.appointment_datetime}

    Please submit a new booking request for another available time.

    Thank you,
    NailTech
    """
    )

    return appointment


# Updates an appointment status to cancelled
@app.patch("/appointments/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.customer))
        .filter(Appointment.appointment_id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = "cancelled"
    db.commit()
    db.refresh(appointment)

    send_email(
        to_email=appointment.customer.email,
        subject="NailTech Appointment Cancelled",
        body=f"""Hi {appointment.customer.first_name},

    Your appointment has been cancelled.

    Requested Date/Time:
    {appointment.appointment_datetime}

    If needed, please submit a new booking request for another available time.

    Thank you,
    NailTech
    """
    )

    return appointment


# Marks an approved appointment as completed
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


# Returns a summary of appointment counts by status and total revenue from completed appointments
@app.get("/analytics/summary")
def get_appointment_summary(days: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Appointment)
    query = apply_days_filter(query, days)

    appointments = query.all()

    total_appointments = len(appointments)
    pending_count = sum(1 for appt in appointments if appt.status == "pending")
    approved_count = sum(1 for appt in appointments if appt.status == "approved")
    declined_count = sum(1 for appt in appointments if appt.status == "declined")
    cancelled_count = sum(1 for appt in appointments if appt.status == "cancelled")
    completed_count = sum(1 for appt in appointments if appt.status == "completed")

    total_revenue = sum(
        float(appt.total_price or 0)
        for appt in appointments
        if appt.status == "completed"
    )

    return {
        "total_appointments": total_appointments,
        "pending": pending_count,
        "approved": approved_count,
        "declined": declined_count,
        "cancelled": cancelled_count,
        "completed": completed_count,
        "completed_revenue": total_revenue,
    }

# Returns the most popular services based on completed appointments, sorted by count
@app.get("/analytics/top-services")
def get_top_services(days: int | None = None, db: Session = Depends(get_db)):
    query = (
        db.query(AppointmentService)
        .join(Appointment)
        .join(Service)
        .filter(Appointment.status == "completed")
    )

    query = apply_days_filter(query, days)

    appointment_services = query.all()

    service_counts = {}

    for row in appointment_services:
        service_name = row.service.service_name

        if service_name in service_counts:
            service_counts[service_name] += 1
        else:
            service_counts[service_name] = 1

    sorted_services = sorted(
        service_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )

    return {
    service: count
    for service, count in sorted_services[:5]
    }


# Returns the most popular service categories based on completed appointments, sorted by count
@app.get("/analytics/service-categories")
def get_service_categories(days: int | None = None, db: Session = Depends(get_db)):
    query = (
        db.query(AppointmentService)
        .join(Appointment)
        .join(Service)
        .filter(Appointment.status == "completed")
    )

    query = apply_days_filter(query, days)

    appointment_services = query.all()

    category_counts = {}

    for row in appointment_services:
        category = row.service.category or "Uncategorized"

        if category in category_counts:
            category_counts[category] += 1
        else:
            category_counts[category] = 1

    sorted_categories = sorted(
        category_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )

    return {
        category: count
        for category, count in sorted_categories
    }

# Returns the most requested workers based on completed appointments
@app.get("/analytics/top-workers")
def get_top_workers(days: int | None = None, db: Session = Depends(get_db)):
    query = (
        db.query(AppointmentService)
        .join(Appointment)
        .filter(Appointment.status == "completed")
        .filter(AppointmentService.requested_worker_id != None)
    )

    query = apply_days_filter(query, days)

    appointment_services = query.all()

    worker_counts = {}

    for row in appointment_services:
        worker = (
            db.query(Worker)
            .filter(Worker.worker_id == row.requested_worker_id)
            .first()
        )

        if not worker:
            continue

        worker_name = f"{worker.first_name} {worker.last_name}"

        if worker_name in worker_counts:
            worker_counts[worker_name] += 1
        else:
            worker_counts[worker_name] = 1

    sorted_workers = sorted(
        worker_counts.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    return {
        worker: count
        for worker, count in sorted_workers
    }

# Returns repeat customer analytics based on completed appointments
@app.get("/analytics/repeat-customers")
def get_repeat_customers(days: int | None = None, db: Session = Depends(get_db)):
    query = (
        db.query(Appointment)
        .filter(Appointment.status == "completed")
    )

    query = apply_days_filter(query, days)

    completed_appointments = query.all()

    customer_counts = {}

    for appt in completed_appointments:
        customer_counts[appt.customer_id] = (
            customer_counts.get(appt.customer_id, 0) + 1
        )

    repeat_customers = sum(
        1 for count in customer_counts.values() if count > 1
    )

    new_customers = sum(
        1 for count in customer_counts.values() if count == 1
    )

    total_customers = len(customer_counts)

    repeat_rate = 0

    if total_customers > 0:
        repeat_rate = round(
            (repeat_customers / total_customers) * 100,
            1
        )

    return {
        "new_customers": new_customers,
        "repeat_customers": repeat_customers,
        "total_customers": total_customers,
        "repeat_rate": repeat_rate,
    }

# Returns the most popular workers based on completed appointments with requested worker, sorted by count
@app.get("/analytics/busiest-days")
def get_busiest_days(days: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Appointment)
    query = apply_days_filter(query, days)

    appointments = query.all()

    day_counts = {
        "Monday": 0,
        "Tuesday": 0,
        "Wednesday": 0,
        "Thursday": 0,
        "Friday": 0,
        "Saturday": 0,
        "Sunday": 0,
    }

    for appt in appointments:
        if appt.status != "completed":
            continue

        day = appt.appointment_datetime.strftime("%A")
        day_counts[day] += 1

    return day_counts

# Returns peak hours for appointments based on completed appointments, grouped by hour of day (0-23) and sorted by count
@app.get("/analytics/peak-hours")
def get_peak_hours(days: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Appointment)
    query = apply_days_filter(query, days)

    appointments = query.all()

    hour_counts = {hour: 0 for hour in range(24)}

    for appt in appointments:
        if appt.status != "completed":
            continue

        hour = appt.appointment_datetime.hour
        hour_counts[hour] += 1

    return {
        f"{hour}:00": count
        for hour, count in hour_counts.items()
    }


# Returns recommendations based on appointment data, such as busiest days/hours and underperforming days
@app.get("/analytics/recommendations")
def get_recommendations(days: int | None = None, db: Session = Depends(get_db)):
    recommendations = []

    query = (
        db.query(Appointment)
        .filter(Appointment.status == "completed")
    )

    query = apply_days_filter(query, days)

    completed_appointments = query.all()

    if not completed_appointments:
        return {
            "recommendations": [
                "Not enough completed appointment data yet to generate recommendations."
            ]
        }

    day_counts = {}
    hour_counts = {}
    customer_counts = {}

    for appt in completed_appointments:
        day = appt.appointment_datetime.strftime("%A")
        hour = appt.appointment_datetime.hour

        day_counts[day] = day_counts.get(day, 0) + 1
        hour_counts[hour] = hour_counts.get(hour, 0) + 1
        customer_counts[appt.customer_id] = customer_counts.get(appt.customer_id, 0) + 1

    busiest_day = max(day_counts, key=day_counts.get)
    slowest_day = min(day_counts, key=day_counts.get)
    busiest_hour = max(hour_counts, key=hour_counts.get)

    total_customers = len(customer_counts)
    repeat_customers = sum(1 for count in customer_counts.values() if count > 1)

    repeat_rate = 0
    if total_customers > 0:
        repeat_rate = round((repeat_customers / total_customers) * 100, 1)

    appointment_services = (
        db.query(AppointmentService)
        .join(Appointment, AppointmentService.appointment_id == Appointment.appointment_id)
        .join(Service, AppointmentService.service_id == Service.service_id)
        .filter(Appointment.status == "completed")
    )

    appointment_services_query = apply_days_filter(appointment_services, days)

    appointment_services = appointment_services_query.all()

    service_counts = {}
    worker_counts = {}

    for row in appointment_services:
        service_name = row.service.service_name
        service_counts[service_name] = service_counts.get(service_name, 0) + 1

        if row.requested_worker_id:
            worker = (
                db.query(Worker)
                .filter(Worker.worker_id == row.requested_worker_id)
                .first()
            )

            if worker:
                worker_name = f"{worker.first_name} {worker.last_name}"
                worker_counts[worker_name] = worker_counts.get(worker_name, 0) + 1
    
    top_service = None
    if service_counts:
        top_service = max(service_counts, key=service_counts.get)

    top_worker = None
    if worker_counts:
        top_worker = max(worker_counts, key=worker_counts.get)

    recommendations.append(
        f"{busiest_day} has the highest completed appointment volume. Consider scheduling additional technicians or limiting time-off requests on this day."
    )

    recommendations.append(
    f"{busiest_hour}:00 is the busiest appointment hour. Consider keeping this time window in mind when reviewing pending requests, especially for longer services or requests for specific technicians."
)

    recommendations.append(
        f"{slowest_day} has lower completed appointment volume. This day may be useful for walk-in promotions, package discounts, or flexible staff scheduling."
    )

    if top_service:
        recommendations.append(
            f"{top_service} is currently the most completed service. Consider keeping enough supplies available and making sure enough appointment slots are open for this service."
        )

    if repeat_rate < 20:
        recommendations.append(
            f"The repeat customer rate is {repeat_rate}%. Consider tracking returning clients more closely and encouraging rebooking after completed appointments."
        )
    else:
        recommendations.append(
            f"The repeat customer rate is {repeat_rate}%. Returning customer activity may help indicate overall customer satisfaction and retention trends."
        )

    return {
        "recommendations": recommendations
    }
