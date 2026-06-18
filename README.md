# NailTech App

NailTech is a full-stack nail salon booking and analytics system built for a capstone portfolio project. The application lets customers browse services and submit booking requests while giving staff an admin dashboard for appointment review, status management, and business analytics.

## Key Features

- Customer-facing service catalog and booking request form
- Admin booking dashboard with appointment status workflows
- Admin-created bookings for staff-entered appointments
- Email notification support for booking updates
- Analytics dashboard for appointment volume, revenue, service demand, repeat customers, busy days, and peak hours
- MySQL schema, seed data, and analysis queries for local recreation

## Tech Stack

- Frontend: React, Vite, React Router, Chart.js
- Backend: FastAPI, SQLAlchemy, PyMySQL
- Database: MySQL
- Deployment targets: Vercel frontend and Railway backend/database

## Folder Structure

```text
backend/       FastAPI API, SQLAlchemy models, schemas, email utilities
database/      MySQL schema, seed data, test queries, analytics queries
frontend/      React/Vite user interface
documentation/ Final report and poster when included in the portfolio repo
```

## Local Setup

### 1. Create the database

Run the database scripts in MySQL Workbench or another MySQL client:

```text
database/schema.sql
database/seed.sql
database/test_queries.sql
database/analytics_queries.sql
```

`schema.sql` creates the `nailtech_db` database and tables. `seed.sql` loads sample services, workers, customers, appointments, and appointment-service rows for testing the booking and analytics workflows.

### 2. Configure backend environment variables

Copy the example environment file and fill in local values:

```bash
cd backend
cp .env.example .env
```

Required:

```text
DATABASE_URL=mysql+pymysql://<user>:<password>@<host>/<database>
```

Optional email notification settings:

```text
EMAIL_ADDRESS=your_email@example.com
EMAIL_PASSWORD=your_app_password_here
```

Real `.env` files are intentionally ignored by Git. Do not commit database passwords, Gmail app passwords, Railway connection strings, or other secrets.

### 3. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend API docs are available locally at:

```text
http://127.0.0.1:8000/docs
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

By default, the frontend uses `http://127.0.0.1:8000` for the API. To point it at another backend, set `VITE_API_URL` before building or running the frontend.

## API Overview

Core endpoints:

- `GET /` - backend health message
- `GET /services` - active nail salon services
- `GET /workers` - active workers
- `GET /customers` - customers for admin views
- `GET /appointments` - appointment list for admin views
- `GET /appointments/{appointment_id}` - appointment details with services
- `POST /booking-request` - customer booking request
- `POST /admin-booking` - staff-created booking
- `PATCH /appointments/{appointment_id}/approve`
- `PATCH /appointments/{appointment_id}/decline`
- `PATCH /appointments/{appointment_id}/cancel`
- `PATCH /appointments/{appointment_id}/complete`

Analytics endpoints:

- `GET /analytics/summary`
- `GET /analytics/top-services`
- `GET /analytics/service-categories`
- `GET /analytics/top-workers`
- `GET /analytics/repeat-customers`
- `GET /analytics/busiest-days`
- `GET /analytics/peak-hours`
- `GET /analytics/recommendations`

## Documentation

Portfolio documentation may include:

- Final report: `documentation/final_report.pdf`
- Poster: `documentation/poster.png`
- ER diagram, relational model, booking workflow, and architecture diagrams from the capstone documentation folder

If the `documentation/` folder is not present in a local clone, the final report, poster, and diagrams may still exist in the surrounding career portfolio folder.

## Screenshots

Recommended screenshots to add before final portfolio review:

- Homepage
- Services page
- Booking form
- Admin dashboard
- Analytics dashboard

Screenshots are optional for local development, but they make the GitHub project easier for recruiters to evaluate quickly.

## Deployment Note

The public frontend or backend may be unavailable if free-tier Railway or Vercel services are paused, deleted, or not currently redeployed. The repository is designed to run locally with the setup steps above.
