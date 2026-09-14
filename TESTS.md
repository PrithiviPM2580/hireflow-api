You should test all important behavior, but not every file with separate unit tests.

1. auth.service.ts: unit tests
Write unit tests for business logic:

Creates a user when email is new.
Passes passwordHash to the repository.
Sends the welcome email.
Returns the created user.
Throws 400 when the email already exists.
Does not create a user or send email when the email exists.
Mock:

authRepository
sendEmail
This is the main unit test file:

auth.service.test.ts

2. Repository: usually integration-tested
You do not need extensive unit tests for this repository because it only calls Mongoose:


Test it indirectly through the registration integration test. That confirms:

The user is actually saved.
passwordHash is stored.
The password is hashed.
Duplicate emails are rejected.
3. Controller and route: integration test
You usually do not need a separate controller unit test because the controller is very thin. Test the real endpoint:


In:

register.test.ts

Test:

Valid request returns 201.
Missing password returns 400.
Using passwordHash instead of password returns 400.
Invalid email returns 400.
Password shorter than six characters returns 400.
Duplicate email returns 400 or 409, depending on your intended API behavior.
Response does not expose passwordHash.
Important test configuration bug
Your tests are inside tests, but vitest.config.ts currently searches test/:


It should be:


Otherwise Vitest will not find or load your tests.

Also, integeration is misspelled. It will still work, but rename it to integration for clarity.

Recommended structure:


The best approach is: unit test the service, integration test the full register endpoint, and do not create separate controller tests unless the controller gains significant logic.