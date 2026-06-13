# MediVision AI — API Documentation

## Base URL
```
Production: https://your-backend-url.com/api/v1
Local: http://localhost:8000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "patient"
}
```

**Response (201):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": "...", "email": "...", "full_name": "...", "role": "patient" }
}
```

### POST /auth/login
Login with email and password.

**Query params:** `email`, `password`

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": "...", "email": "..." }
}
```

### GET /auth/me
Get current authenticated user. **Requires auth.**

### POST /auth/refresh
Refresh access token.

**Query params:** `refresh_token`

---

## Analysis Endpoints

### POST /analysis/upload
Upload medical image for AI analysis. **Requires auth.**

**Content-Type:** `multipart/form-data`
- `file`: Image file (JPG, PNG, DICOM)
- `image_type`: `ecg` | `mri` | `ct_scan` | `x_ray`

**Response (200):**
```json
{
  "id": "...",
  "prediction": "Normal",
  "confidence_score": 0.97,
  "risk_level": "low",
  "findings": ["No abnormalities detected"],
  "recommendations": ["Continue regular checkups"],
  "ai_explanation": "..."
}
```

### GET /analysis/results
Get user's analysis history. **Requires auth.**

**Query params:** `skip` (default 0), `limit` (default 20)

### GET /analysis/results/:id
Get analysis detail. **Requires auth.**

### DELETE /analysis/results/:id
Delete analysis. **Requires auth.**

---

## Chatbot Endpoints

### POST /chatbot/chat
Send message to AI chatbot. **Requires auth.**

**Body:**
```json
{
  "content": "What are the symptoms of heart disease?",
  "session_id": "optional",
  "language": "english"
}
```

**Response:**
```json
{
  "reply": "Common symptoms include chest pain, shortness of breath...",
  "session_id": "...",
  "suggested_prompts": ["..."]
}
```

### POST /chatbot/sessions
Create new chat session. **Requires auth.**

### GET /chatbot/sessions
Get user's chat sessions. **Requires auth.**

### GET /chatbot/sessions/:id/messages
Get session messages. **Requires auth.**

### DELETE /chatbot/sessions/:id
Delete session. **Requires auth.**

---

## Reports Endpoints

### POST /reports/generate/:analysisId
Generate PDF report for an analysis. **Requires auth.**

### GET /reports/my-reports
Get user's reports. **Requires auth.**

### GET /reports/download/:reportId
Download PDF report. **Requires auth.**

---

## Appointments Endpoints

### POST /appointments/book
Book appointment. **Requires auth.**

**Body:**
```json
{
  "doctor_id": "...",
  "appointment_date": "2024-06-15T10:00:00Z",
  "type": "video_call",
  "reason": "Heart checkup"
}
```

### GET /appointments/my-appointments
Get user's appointments. **Requires auth.**

### PATCH /appointments/:id
Update appointment status. **Requires auth.**

---

## Notifications Endpoints

### GET /notifications
Get user notifications. **Requires auth.**
**Query params:** `unread_only` (boolean)

### POST /notifications/:id/read
Mark as read. **Requires auth.**

### POST /notifications/read-all
Mark all as read. **Requires auth.**

### GET /notifications/unread-count
Get unread count. **Requires auth.**

---

## Doctors Endpoints

### GET /doctors/list
List verified doctors.
**Query params:** `specialization`

### GET /doctors/profile
Get doctor profile. **Requires doctor role.**

### PUT /doctors/profile
Update doctor profile. **Requires doctor role.**

---

## Patients Endpoints

### GET /patients/profile
Get patient profile. **Requires patient role.**

### PUT /patients/profile
Update patient profile. **Requires patient role.**

---

## Admin Endpoints

### GET /admin/users
Get all users. **Requires admin role.**
**Query params:** `role`, `status`, `limit`, `skip`

### PATCH /admin/users/:id/status
Update user status. **Requires admin role.**

### GET /admin/stats
Get platform statistics. **Requires admin role.**

---

## Analytics Endpoints

### GET /analytics/dashboard
Get dashboard analytics. **Requires auth.**

### GET /analytics/patient/:patientId
Get patient analytics. **Requires doctor or admin role.**

---

## WebSocket

### WS /ws/notifications
Real-time notifications. Connect with token query param:
```
ws://localhost:8000/ws/notifications?token=<access_token>
```

**Client → Server messages:**
```json
{ "type": "ping" }
```

**Server → Client messages:**
```json
{ "type": "notification", "title": "...", "message": "...", "priority": "high" }
{ "type": "pong" }
```

---

## Health Check

### GET /health
```json
{ "status": "healthy", "app": "MediVision AI", "version": "1.0.0" }
```

---

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message"
}
```

**Status codes:**
- `400` — Bad request
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (wrong role)
- `404` — Not found
- `409` — Conflict (duplicate email)
- `429` — Rate limit exceeded
- `500` — Internal server error
