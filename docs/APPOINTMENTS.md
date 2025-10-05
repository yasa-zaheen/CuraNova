# CuraNova Appointments System

This document describes the simplified appointments system implementation.

## Database Schema

### Appointments Table

```sql
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
    diagnostic_id UUID NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ,
    appointment_time TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### POST /api/appointments

Creates a new appointment for a user.

**Request Body:**

```json
{
  "userId": "string",
  "diagnosticId": "string",
  "preferredDate": "string (optional)",
  "preferredTime": "string (optional)"
}
```

**Response:**

```json
{
  "message": "Appointment request submitted successfully",
  "appointment": {
    "id": "uuid",
    "user_id": "string",
    "diagnostic_id": "uuid",
    "appointment_date": "timestamp",
    "appointment_time": "string",
    "status": "scheduled",
    "created_at": "timestamp"
  }
}
```

## Frontend Components

### Appointments Page (`/appointments`)

- View all user appointments
- Cancel scheduled appointments
- Confirm appointments
- Display appointment statistics

### Diabetes Test Modal

- Automatically triggers appointment booking for high-risk results (>50% diabetes probability)
- Simplified booking with just user ID and diagnostic ID

### Doctor Dashboard (`/doctor`)

- View all patient tests and diagnostics
- Monitor appointment requests

## Key Features

1. **Simplified Schema**: Removed unnecessary fields like `doctor_name`, `notes`, and `updated_at`
2. **Automatic Scheduling**: High diabetes risk automatically triggers appointment booking
3. **Status Management**: Support for scheduled, confirmed, completed, and cancelled statuses
4. **User Integration**: Links to Clerk user system via `user_id`
5. **Diagnostic Linking**: Each appointment is linked to a specific diagnostic record

## Usage Flow

1. Patient completes diabetes screening test
2. ML model predicts diabetes risk
3. If risk > 50%, "Schedule Appointment" button appears
4. Click button to automatically create appointment
5. Patient can view/manage appointments at `/appointments`
6. Doctor can monitor all tests and appointments at `/doctor`

## Default Values

- **Appointment Date**: 7 days from creation
- **Appointment Time**: 9:00 AM
- **Status**: scheduled
- **Doctor**: Dr. Sarah Johnson (hardcoded in UI)
