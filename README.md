# hireflow-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
Yes. If your goal is a **production-level Node.js backend for your internship CV**, I would **not** make a basic todo, blog, or simple e-commerce CRUD.

I recommend building a **Job Marketplace / Hiring Platform API**.

## 🚀 Project: HireFlow — Job Marketplace API

Think of a backend similar to a simplified **LinkedIn/Indeed hiring system**, but your focus is entirely on the API.

You can have three types of users:

```
                    HireFlow API
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Candidate       Recruiter       Admin
          │              │              │
       Apply          Post Jobs       Manage
       Jobs           Manage Jobs     Platform
       Profile        Candidates
       Resume
```

This is excellent for a backend portfolio because it forces you to solve **real backend problems**, not just CRUD.

## Core features

### Authentication

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

Implement:

- Password hashing
- Access + refresh tokens
- Token rotation
- Email verification
- Password reset
- Role-based authorization
- Account lock/rate limiting

### Users

```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
```

Candidates have:

```
Profile
Skills
Experience
Education
Resume
Portfolio
```

Recruiters have:

```
Company
Position
Company description
```

### Jobs

```
GET    /api/v1/jobs
GET    /api/v1/jobs/:id

POST   /api/v1/jobs
PATCH  /api/v1/jobs/:id
DELETE /api/v1/jobs/:id
```

Make the search realistic:

```
GET /api/v1/jobs?
    search=nodejs
    &location=remote
    &salaryMin=50000
    &salaryMax=100000
    &experience=2
    &page=1
    &limit=20
    &sort=recent
```

Now you're dealing with:

- Filtering
- Searching
- Pagination
- Sorting
- Database indexes
- Query optimization

That's much more interesting to an interviewer.

## Applications

This should be one of your most important modules.

```
POST   /api/v1/jobs/:jobId/apply

GET    /api/v1/applications/me

GET    /api/v1/jobs/:jobId/applications

PATCH  /api/v1/applications/:id/status
```

Application status:

```
APPLIED
   ↓
SCREENING
   ↓
INTERVIEW
   ↓
OFFER
   ↓
HIRED
```

or:

```
REJECTED
WITHDRAWN
```

You can enforce valid state transitions in your backend.

## Notifications

Now you start getting into **real production architecture**.

For example:

```
Recruiter changes application status
              ↓
          Event created
              ↓
        Background worker
              ↓
       Send notification
              ↓
         Email / in-app
```

Use something like **Redis + BullMQ** for background jobs.

Examples:

- Application received
- Application status changed
- Interview scheduled
- Password reset email
- Email verification
- Job recommendation

## Interview scheduling

Add:

```
POST   /api/v1/interviews
GET    /api/v1/interviews
PATCH  /api/v1/interviews/:id
DELETE /api/v1/interviews/:id
```

Handle:

- Interview time
- Candidate
- Recruiter
- Status
- Meeting URL
- Rescheduling

This introduces interesting problems such as **time zones and conflicting schedules**.

## Admin

```
GET    /api/v1/admin/users
GET    /api/v1/admin/jobs
GET    /api/v1/admin/applications

PATCH  /api/v1/admin/users/:id/status
PATCH  /api/v1/admin/jobs/:id/status
```

Admin can:

- Suspend users
- Moderate jobs
- Remove fraudulent listings
- View platform statistics

---

# Your architecture

I'd use the **module-based architecture** we discussed:

```
src/
│
├── config/
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   └── auth.types.ts
│   │
│   ├── users/
│   ├── jobs/
│   ├── applications/
│   ├── companies/
│   ├── interviews/
│   ├── notifications/
│   └── admin/
│
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── validation.middleware.ts
│
├── utils/
│
├── app.ts
└── server.ts
```

The request flow:

```
Request
   ↓
Rate Limiter
   ↓
Authentication
   ↓
Validation
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL
```

That's the architecture I want you to understand—not just copy.

---

# Technology stack

For your current Node.js path, I'd use:

| Area            | Technology                   |
| --------------- | ---------------------------- |
| Runtime         | Node.js                      |
| Language        | TypeScript                   |
| Framework       | Express                      |
| Database        | PostgreSQL                   |
| ORM             | Prisma                       |
| Authentication  | JWT                          |
| Validation      | Zod                          |
| API docs        | OpenAPI + Swagger UI         |
| Cache           | Redis                        |
| Background jobs | BullMQ                       |
| Testing         | Vitest                       |
| API testing     | Postman                      |
| Containers      | Docker                       |
| CI/CD           | GitHub Actions               |
| Logging         | Pino                         |
| Security        | Helmet + rate limiting       |
| Deployment      | Any reputable cloud platform |

You **don't need to learn all of these before starting**.

Build the core first, then progressively introduce the production features.

---

# The feature that will make it stand out

Don't just make:

```
POST /jobs
GET /jobs
DELETE /jobs
```

Make the backend demonstrate **engineering decisions**.

For example:

### Database transactions

When a candidate applies:

```
BEGIN TRANSACTION

Create application
↓
Update job application count
↓
Create notification

COMMIT
```

If something fails:

```
ROLLBACK
```

### Idempotency

For important operations, prevent accidental duplicate requests:

```
POST /payments
Idempotency-Key: abc123
```

Even if the client retries the request, you don't accidentally perform the operation twice.

### Rate limiting

For example:

```
/login
   ↓
5 attempts / minute
```

while normal endpoints might have a different limit.

### Pagination

Don't return 100,000 jobs:

```
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1523,
    "totalPages": 77
  }
}
```

### Consistent errors

Instead of random errors from every controller:

```
{
  "success": false,
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "Job not found"
  }
}
```

### Observability

Have structured logs such as:

```
INFO  POST /api/v1/jobs 201 124ms
INFO  GET /api/v1/jobs 200 43ms
ERROR POST /api/v1/applications 500 82ms
```

---

# Your API should be publicly testable

This connects directly to your earlier Swagger question.

Your deployed project should have:

```
https://your-domain.com/api/v1/...
```

and:

```
https://your-domain.com/api-docs
```

The second one opens **Swagger UI**, generated from your **OpenAPI specification**.

A recruiter can literally:

```
Open API docs
      ↓
Authenticate
      ↓
Try GET /jobs
      ↓
Try POST /jobs
      ↓
Try POST /jobs/:id/apply
      ↓
See your real API responses
```

That's exactly the type of portfolio project I'd want you to show.

---

# Build it in stages

**Don't try to build the entire thing at once.**

### Stage 1 — Foundation

```
Node
TypeScript
Express
Environment variables
Error handling
Git
```

### Stage 2 — Database

```
PostgreSQL
Prisma
Users
Companies
Jobs
Applications
```

### Stage 3 — Authentication

```
Register
Login
JWT
Refresh tokens
Roles
Authorization
```

### Stage 4 — Core API

```
Jobs
Companies
Applications
Profiles
```

### Stage 5 — Production features

```
Validation
Rate limiting
Logging
Pagination
Filtering
Sorting
Transactions
Indexes
```

### Stage 6 — Advanced

```
Redis
BullMQ
Notifications
Email
Interview scheduling
Caching
```

### Stage 7 — Professional delivery

```
Swagger/OpenAPI
Unit tests
Integration tests
Docker
GitHub Actions
Deployment
Monitoring
README
```

At the end, your GitHub repository isn't just:

> "Node.js project"

It demonstrates **API design, databases, authentication, architecture, security, testing, deployment, and production concerns**.

**That's the project I'd choose for your backend internship CV.** And since you're learning Node.js now, we can build it progressively rather than dropping a huge codebase on you that you won't understand.
