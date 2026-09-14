# Flow of the Routes

## Register

The registration flow is:

```text
POST /register
       │
       ▼
registerValidator
       │
       │ valid?
       ├──── No ────► Validation Error
       │
       ▼
authController.register
       │
       ▼
authService.register(req.body)
       │
       ├── Check existing user
       │
       ├── Hash password
       │
       ├── Create user
       │
       └── Send welcome email
       │
       ▼
sendResponse()
       │
       ▼
HTTP 201 Created
````

### Flow Description

 1. **POST `/register`**
   - Client sends the registration request.
2. **`registerValidator`**
   - Validates the request body.
   - If validation fails, return a validation error.
3. **`authController.register`**
   - Receives the validated request.
   - Passes the request data to the authentication service.
4. **`authService.register(req.body)`**
   - Checks whether the user already exists.
   - Hashes the password.
   - Creates the new user.
   - Sends a welcome email.
5. **`sendResponse()`**
   - Sends the standardized API response.
6. **HTTP `201 Created`**
   - Returned when the registration is successful.

 ## Architecture

```
Route
  │
  ▼
Validator
  │
  ▼
Controller
  │
  ▼
Service
  │
  ├── Database
  │
  └── Email Service
  │
  ▼
Response
```

 ### Responsibility of Each Layer

 | Layer | Responsibility |
| --- | --- |
| Route | Defines the API endpoint |
| Validator | Validates incoming request data |
| Controller | Handles HTTP request/response |
| Service | Contains business logic |
| Database | Stores user information |
| Email Service | Sends the welcome email |
| Response | Returns the API response |
