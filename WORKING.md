1. Register API first

Create:

POST /api/v1/auth/register

It should:

Receive name/email/password
        ↓
Check if user exists
        ↓
Hash password
        ↓
Create user
        ↓
Generate verification token
        ↓
Save token + expiry
        ↓
Send verification email
        ↓
Return "Check your email"

2. Then build verify-email API

Create:

GET /api/v1/auth/verify-email?token=xxxxx

It should:

Receive token
      ↓
Find token
      ↓
Check expiration
      ↓
Find user
      ↓
Set emailVerified = true
      ↓
Remove/invalidate token
      ↓
Return success