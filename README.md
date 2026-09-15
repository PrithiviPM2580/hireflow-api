# Hireflow API

Hireflow is a TypeScript, Express, MongoDB, and Mongoose backend for a job marketplace and hiring platform.

The API is organized around authentication first, followed by companies, jobs, applications, interviews, and notifications.

## Contents

- [Technology](#technology)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Base URLs](#api-base-urls)
- [Routes](#routes)
- [Route Flows](#route-flows)
- [Testing](#testing)
- [Development Roadmap](#development-roadmap)

## Technology

- Bun
- TypeScript
- Express 5
- MongoDB and Mongoose
- Zod and `zod-express-validator`
- JWT and bcrypt
- Vitest and Supertest
- Swagger UI and OpenAPI

## Getting Started

### Install dependencies

```bash
bun install
```

### Configure environment variables

Create a `.env` file with the values required by `src/schema/app.schema.ts`. The application requires database, JWT, email, and security configuration.

### Run the development server

```bash
bun run dev
```

The default server URL is:

```text
http://localhost:3000
```

### Run checks

```bash
bun run type-check
bun run lint
bun run test:run
```

## Project Structure

```text
hireflow-api/
├── docs/
│   └── openapi/                 # OpenAPI files and path documentation
├── http/
│   └── auth.http                # REST Client requests for manual testing
├── src/
│   ├── app.ts                   # Express application and middleware setup
│   ├── index.ts                 # Application entry point
│   ├── server.ts                # HTTP server and database startup
│   ├── config/                  # Application, database, email, and Swagger config
│   ├── constants/               # Shared application constants
│   ├── database/
│   │   ├── database.ts          # MongoDB connection
│   │   └── models/               # Mongoose models
│   ├── middlewares/              # Validation, errors, security, uploads, and rate limits
│   ├── modules/
│   │   ├── auth/                 # Registration, login, and authentication flows
│   │   └── verification/         # Email verification data access
│   ├── openapi/                  # OpenAPI registry and generated document
│   ├── routes/                   # Root, health, and module route mounting
│   ├── schema/                   # Zod schemas and JWT payload schemas
│   ├── types/                    # Shared TypeScript types and Express declarations
│   └── utils/                    # JWT, bcrypt, errors, email, logging, and responses
├── tests/
│   ├── integration/              # Tests through the HTTP endpoints
│   ├── unit/                     # Isolated service and utility tests
│   └── setup.ts                  # Test database and environment setup
├── FLOW.md                       # Detailed implementation flow notes
├── TESTS.md                      # Testing strategy
├── WORKING.md                    # Current implementation checklist
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Current database models

```text
src/database/models/
├── application.model.ts
├── candidate.model.ts
├── company.model.ts
├── interview.model.ts
├── job.model.ts
├── notification.model.ts
├── reset.model.ts
├── session.model.ts
├── user.model.ts
└── verification.model.ts
```

## API Base URLs

| Purpose | URL |
| --- | --- |
| API root | `http://localhost:3000` |
| Versioned API | `http://localhost:3000/api/v1` |
| Swagger UI | `http://localhost:3000/api-docs` |

Swagger documents the registered OpenAPI paths. Use the API root for `/` and `/health`, and the versioned API URL for authentication routes.

## Routes

### Implemented routes

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Return API status and application information |
| `GET` | `/health` | Public | Return application and database health information |
| `POST` | `/api/v1/auth/register` | Public | Create a user and send an email verification link |

### Authentication routes to implement next

These routes are part of the planned authentication flow. They should be added to the auth router only when their controller and service logic are implemented.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/auth/verify-email?token=...` | Public | Verify the user's email address |
| `POST` | `/api/v1/auth/login` | Public | Authenticate a verified user and issue tokens |
| `POST` | `/api/v1/auth/refresh` | Public | Issue a new access token from a valid refresh token |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke the current session |
| `POST` | `/api/v1/auth/forgot-password` | Public | Send a password reset link |
| `POST` | `/api/v1/auth/reset-password` | Public | Set a new password using a reset token |

## Route Flows

Each route should follow the same application architecture:

```text
Request
   ↓
Route
   ↓
Validator
   ↓
Controller
   ↓
Service
   ↓
Repository / Database / External service
   ↓
Response
```

### `GET /`

Purpose: Confirm that the API is running and return basic application information.

```text
GET /
   ↓
Receive request
   ↓
Build application status data
   ↓
Read app name, version, environment, and uptime
   ↓
Send standardized success response
   ↓
HTTP 200 OK
```

Response data includes:

- `appName`
- `status`
- `timestamp`
- `version`
- `env`

Test cases:

- Returns HTTP `200`.
- Returns `success: true`.
- Returns the message `Hireflow API is running successfully`.
- Returns application status data.
- Returns a valid ISO timestamp.

### `GET /health`

Purpose: Check whether the application and MongoDB connection are available.

```text
GET /health
       ↓
Receive request
       ↓
Read MongoDB connection state
       ↓
Read application environment and runtime metrics
       ↓
Build health response
       ↓
Send standardized success response
       ↓
HTTP 200 OK
```

Response data includes:

- `status`
- `service`
- `environment`
- `database`
- `uptime`
- `memoryUsage`
- `timestamp`

Test cases:

- Returns HTTP `200`.
- Returns `success: true`.
- Returns the message `Health check successful`.
- Returns either `Connected` or `Disconnected` for `database`.
- Returns numeric `uptime`.
- Returns a valid ISO timestamp.

### `POST /api/v1/auth/register`

Purpose: Create a new user account and start email verification.

```text
POST /api/v1/auth/register
       ↓
Validate name, email, and password
       ↓
Check whether the email already exists
       ↓
Hash the password
       ↓
Create the user with isVerified = false
       ↓
Generate an email verification JWT
       ↓
Save the verification record and expiry time
       ↓
Build the verification URL
       ↓
Send the verification email
       ↓
Return the created user without passwordHash
       ↓
HTTP 201 Created
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

Test cases:

- A valid request returns HTTP `201`.
- The response contains `success: true`.
- The response message is `User created successfully`.
- The user is saved with the supplied name and email.
- The stored password is hashed.
- The response does not contain `passwordHash`.
- The new user starts with `isVerified: false`.
- A verification record is created for the user.
- A verification email is sent.
- Duplicate email returns HTTP `400` with `User already exists`.
- Missing name returns HTTP `400`.
- Invalid email returns HTTP `400`.
- Missing password returns HTTP `400`.
- A password shorter than six characters returns HTTP `400`.

### `GET /api/v1/auth/verify-email?token=...`

Purpose: Verify the email address associated with a newly registered account.

```text
GET /api/v1/auth/verify-email?token=...
       ↓
Validate that the token query parameter exists
       ↓
Verify the JWT signature, issuer, audience, and expiry
       ↓
Read userId and verificationId from the token
       ↓
Find the verification record by verificationId
       ↓
Confirm the record belongs to userId
       ↓
Confirm the verification record has not expired
       ↓
Find the user by userId
       ↓
Set user.isVerified = true
       ↓
Save the user
       ↓
Delete or mark the verification record as used
       ↓
Return email verification success
       ↓
HTTP 200 OK
```

Test cases:

- A valid token returns HTTP `200`.
- The response message is `Email verified successfully`.
- The user's `isVerified` value changes from `false` to `true`.
- The verification record is deleted or marked as used.
- A missing token returns HTTP `400`.
- A malformed token returns an authentication error.
- An expired JWT returns an authentication error.
- A token for a missing verification record is rejected.
- A token whose `userId` does not match the verification record is rejected.
- A token for a missing user is rejected.
- Reusing a consumed token is rejected.

### `POST /api/v1/auth/login`

Purpose: Authenticate a user and create an authenticated session.

```text
POST /api/v1/auth/login
       ↓
Validate email and password
       ↓
Find the user by email
       ↓
Compare the password with passwordHash
       ↓
Confirm the account is active
       ↓
Confirm the email is verified
       ↓
Create a session record
       ↓
Generate an access token
       ↓
Generate a refresh token
       ↓
Store only the hashed refresh token
       ↓
Return tokens and safe user data
       ↓
HTTP 200 OK
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

Test cases:

- A verified user with the correct password returns HTTP `200`.
- The response contains an access token.
- The response contains a refresh token.
- A session is created for the user.
- The stored refresh token is hashed.
- The response does not contain `passwordHash`.
- An unknown email returns an authentication error.
- An incorrect password returns an authentication error.
- An unverified user cannot log in.
- An inactive user cannot log in.
- Missing email returns HTTP `400`.
- Invalid email returns HTTP `400`.
- Missing password returns HTTP `400`.

### `POST /api/v1/auth/refresh`

Purpose: Replace an expired or nearly expired access token with a new one.

```text
POST /api/v1/auth/refresh
       ↓
Validate the refresh token
       ↓
Read userId and sessionId from the token
       ↓
Find the session
       ↓
Confirm the session is active and not expired
       ↓
Compare the supplied token with the stored token hash
       ↓
Rotate the refresh token
       ↓
Issue a new access token
       ↓
Return the new token pair
```

Test cases:

- A valid refresh token returns new tokens.
- An invalid refresh token is rejected.
- An expired refresh token is rejected.
- A revoked session is rejected.
- A refresh token from another session is rejected.
- The old refresh token cannot be reused after rotation.

### `POST /api/v1/auth/logout`

Purpose: End the current authenticated session.

```text
POST /api/v1/auth/logout
       ↓
Authenticate the access token
       ↓
Read the sessionId
       ↓
Find the session
       ↓
Set revokedAt
       ↓
Return logout success
```

Test cases:

- An authenticated request returns HTTP `200`.
- The current session is marked revoked.
- The revoked session cannot refresh tokens.
- A missing access token is rejected.
- An invalid access token is rejected.

### Password reset routes

#### `POST /api/v1/auth/forgot-password`

```text
Receive email
       ↓
Validate email
       ↓
Find the user
       ↓
Generate a password reset token
       ↓
Store the hashed token with an expiry
       ↓
Send the reset email
       ↓
Return a generic success response
```

Test cases:

- A valid email returns a generic success response.
- The response does not reveal whether an email exists.
- A reset record is created with an expiry.
- A reset email is sent when the user exists.
- Invalid email input returns HTTP `400`.

#### `POST /api/v1/auth/reset-password`

```text
Receive reset token and new password
       ↓
Validate the request
       ↓
Verify the reset token
       ↓
Find the reset record
       ↓
Find the user
       ↓
Hash and save the new password
       ↓
Mark the reset token as used or delete it
       ↓
Revoke existing sessions
       ↓
Return password reset success
```

Test cases:

- A valid token changes the password.
- The new password is stored as a hash.
- The reset token cannot be reused.
- An expired token is rejected.
- An invalid token is rejected.
- Existing sessions are revoked after a password reset.
- Invalid password input returns HTTP `400`.

## Testing

### Test layers

| Layer | Purpose | Location |
| --- | --- | --- |
| Unit | Test service logic with dependencies mocked | `tests/unit/` |
| Integration | Test the real Express route and database behavior | `tests/integration/` |
| Manual HTTP | Send requests from VS Code REST Client | `http/` |
| Swagger | Try documented endpoints interactively | `/api-docs` |

### Run the test suite

```bash
bun run test:run
```

During development, use watch mode:

```bash
bun run test
```

### Register route test location

```text
tests/
├── integration/
│   └── auth/
│       └── register.test.ts
└── unit/
    └── auth/
        └── auth.service.test.ts
```

The register integration test verifies that a user and verification record are created, the password is hashed, and duplicate emails are rejected.

### Test the API in three places

The same endpoint should be checked using:

1. VS Code REST Client: `http/auth.http`
2. Swagger UI: `http://localhost:3000/api-docs`
3. Vitest: `tests/integration/` and `tests/unit/`

## Development Roadmap

### Phase 1: Authentication

- Register
- Verify email
- Login
- Refresh token
- Logout
- Forgot password
- Reset password

### Phase 2: Hiring platform

- Candidate profile
- Company creation and management
- Job creation and publishing
- Public job listing and search
- Candidate applications
- Recruiter application review
- Application status changes

### Phase 3: Advanced features

- Interview scheduling
- Notifications
- Background email jobs
- Redis and BullMQ integration
- Audit logs and analytics

## Security Rules

- Never store a plain-text password.
- Never return `passwordHash` in an API response.
- Store refresh and reset tokens as hashes where possible.
- Require email verification before login.
- Revoke sessions after a password reset.
- Use short-lived access tokens and rotating refresh tokens.
- Keep secrets in environment variables.
