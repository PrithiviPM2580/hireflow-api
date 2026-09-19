//! ============================================================
//! 🧪 Auth Test — Test suite for auth
//! ============================================================

import "../../setup";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import app from "@/app";
import Session from "@/database/models/session.model";
import User from "@/database/models/user.model";
import Verification from "@/database/models/verification.model";
import { compareValue } from "@/utils/bcrypt.util";

// Mock: Mock the necessary modules and functions
vi.mock("@/config/app.config", () => ({
	appConfig: {
		APP_ORIGIN: "http://localhost:3000",
		APP_NAME: "Hireflow API",
		APP_VERSION: "test",
		BASE_PATH: "/api/v1",
		NODE_ENV: "test",
		JWT_AUDIENCE: "test-user",
		JWT_ISSUER: "hireflow-test",
		JWT_EMAIL_VERIFICATION_SECRET: "test-email-secret",
		JWT_EMAIL_VERIFICATION_EXPIRES_IN: "30m",
		JWT_ACCESS_SECRET: "test-access-secret",
		JWT_ACCESS_EXPIRES_IN: "15m",
		JWT_REFRESH_SECRET: "test-refresh-secret",
		JWT_REFRESH_EXPIRES_IN: "7d",
		EMAIL_FROM: "test@example.com",
	},
}));

// Mock: Mock the necessary modules and functions
vi.mock("@/config/resend.config", () => ({
	sendEmail: vi.fn().mockResolvedValue({ id: "test-email-id" }),
}));

// Mock: Mock the necessary modules and functions
vi.mock("@/utils/jwt.util", () => ({
	signEmailVerificationToken: vi
		.fn()
		.mockReturnValue("test-verification-token"),
	verifyEmailVerificationToken: vi.fn(),
	signAccessToken: vi.fn().mockReturnValue("test-access-token"),
	signRefreshToken: vi.fn().mockReturnValue("test-refresh-token"),
	verifyRefreshToken: vi.fn(),
}));

//~ -----------------------------------------------------------------
//~ Spec: POST /api/v1/auth/register — Desc: Test the registration endpoint
//~ -----------------------------------------------------------------
describe("POST /api/v1/auth/register", () => {
	// Setup: Clean up the database after each test
	afterEach(async () => {
		await User.deleteMany({});
		await Verification.deleteMany({});
	});

	// Test: Register a user and create an email verification record
	it("registers a user and creates an email verification record", async () => {
		// Arrange: Prepare the request payload for user registration
		const response = await request(app).post("/api/v1/auth/register").send({
			name: "John Doe",
			email: "john@example.com",
			password: "Password123!",
		});

		// Assert: Verify the response and database records
		expect(response.status).toBe(201);

		// Assert: Verify the response body and data
		expect(response.body).toMatchObject({
			success: true,
			message: "User created successfully",
		});

		// Assert: Verify the response data contains the expected user information
		expect(response.body.data).toMatchObject({
			user: {
				name: "John Doe",
				email: "john@example.com",
				isVerified: false,
			},
		});

		// Assert: Verify the user and verification records in the database
		const user = await User.findOne({ email: "john@example.com" }).lean();

		// Assert: Verify the verification record in the database
		const verification = await Verification.findOne({
			userId: user?._id,
		}).lean();

		// Assert: Verify that the user and verification records are not null and have the expected properties
		expect(user).not.toBeNull();

		// Assert: Verify that the user's password hash is not the plain text password
		expect(user?.passwordHash).not.toBe("Password123!");

		// Assert: Verify that the verification record is not null and has the expected properties
		expect(verification).not.toBeNull();

		// Assert: Verify that the verification record's token hash is not the plain text token and matches the user's ID
		expect(verification?.tokenHash).not.toBe("test-verification-token");

		// Assert: Verify that the verification record's user ID matches the user's ID
		expect(verification?.userId.toString()).toBe(user?._id.toString());
	});

	// Test: Reject registration when the email already exists
	it("rejects registration when the email already exists", async () => {
		// Arrange: Create an existing user in the database
		await User.create({
			name: "Existing User",
			email: "john@example.com",
			passwordHash: "Password123!",
		});

		// Act: Attempt to register a new user with the same email
		const response = await request(app).post("/api/v1/auth/register").send({
			name: "John Doe",
			email: "john@example.com",
			password: "Password123!",
		});

		// Assert: Verify the response
		expect(response.status).toBe(400);

		// Assert: Verify the response body contains the expected error message
		expect(response.body).toMatchObject({
			message: "User already exists",
		});
	});
});

//~ -----------------------------------------------------------------
//~ Spec: GET /api/v1/auth/verify-email — Desc: Test the email verification endpoint
//~ -----------------------------------------------------------------
describe("GET /api/v1/auth/verify-email", () => {
	// Test: Verify a user's email and remove the verification record
	it("verifies a user's email and removes the verification record", async () => {
		// Arrange: Create a user and a verification record in the database
		const user = await User.create({
			name: "John Doe",
			email: "john@example.com",
			passwordHash: "Password123!",
		});

		// Arrange: Create a verification record for the user in the database
		const verification = await Verification.create({
			userId: user._id,
			tokenHash: "test-verification-token",
			expiresAt: new Date(Date.now() + 30 * 60 * 1000),
		});

		// Mock: Mock the verifyEmailVerificationToken function to return a valid payload
		const { verifyEmailVerificationToken } = await import("@/utils/jwt.util");

		// Mock: Mock the verifyEmailVerificationToken function to return a valid payload
		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: user._id.toString(),
			verificationId: verification._id.toString(),
			type: "email_verification",
		});

		// Act: Send a GET request to the email verification endpoint with the token
		const response = await request(app)
			.get("/api/v1/auth/verify-email")
			.query({ token: "test-verification-token" });

		// Assert: Verify the response status and body
		expect(response.status).toBe(200);

		// Assert: Verify the response body contains the expected success message and user data
		expect(response.body).toMatchObject({
			success: true,
			message: "Email verified successfully",
			data: {
				user: {
					email: "john@example.com",
					isVerified: true,
				},
			},
		});

		// Assert: Verify that the user's isVerified property is set to true and the verification record is removed from the database
		const verifiedUser = await User.findById(user._id).lean();

		// Assert: Verify that the user's isVerified property is set to true and the verification record is removed from the database
		expect(verifiedUser?.isVerified).toBe(true);

		// Assert: Verify that the verification record is removed from the database
		expect(await Verification.findById(verification._id)).toBeNull();
	});
});

//~ -----------------------------------------------------------------
//~ Spec: POST /api/v1/auth/login — Desc: Test the login endpoint
//~ -----------------------------------------------------------------
describe("POST /api/v1/auth/login", () => {
	// Test: Log in a verified user and create a session
	it("logs in a verified user and creates a session", async () => {
		// Arrange: Create a verified user in the database
		const user = await User.create({
			name: "John Doe",
			email: "john@example.com",
			passwordHash: "Password123!",
			isVerified: true,
		});

		// Arrange: Mock the compareValue function to return true for password comparison
		const response = await request(app).post("/api/v1/auth/login").send({
			email: "john@example.com",
			password: "Password123!",
		});

		// Assert: Verify the response status and body
		expect(response.status).toBe(200);

		// Assert: Verify the response body contains the expected success message and user data
		expect(response.body).toMatchObject({
			success: true,
			message: "Login successful",
			data: {
				user: {
					email: "john@example.com",
					isVerified: true,
				},
				accessToken: "test-access-token",
				refreshToken: "test-refresh-token",
			},
		});

		// Assert: Verify that a session is created in the database for the logged-in user
		const session = await Session.findOne({ userId: user._id }).lean();

		// Assert: Verify that the session is not null and has the expected properties
		expect(session).not.toBeNull();

		// Assert: Verify that the session's userId matches the user's ID and the tokenHash is not the plain text refresh token
		expect(session?.userId.toString()).toBe(user._id.toString());

		// Assert: Verify that the session's tokenHash is not the plain text refresh token and matches the hashed value of the refresh token
		expect(session?.tokenHash).not.toBe("test-refresh-token");

		// Assert: Verify that the session's tokenHash matches the hashed value of the refresh token
		expect(
			await compareValue("test-refresh-token", session?.tokenHash ?? ""),
		).toBe(true);
	});
});

//~ -----------------------------------------------------------------
//~ Spec: POST /api/v1/auth/refresh — Desc: Test refresh-token rotation
//~ -----------------------------------------------------------------
describe("POST /api/v1/auth/refresh", () => {
	it("refreshes the session and rotates the refresh cookie", async () => {
		const user = await User.create({
			name: "John Doe",
			email: "john@example.com",
			passwordHash: "Password123!",
			isVerified: true,
		});

		const loginResponse = await request(app).post("/api/v1/auth/login").send({
			email: "john@example.com",
			password: "Password123!",
		});

		expect(loginResponse.status).toBe(200);

		const session = await Session.findOne({ userId: user._id });
		expect(session).not.toBeNull();

		const { signRefreshToken, verifyRefreshToken } = await import(
			"@/utils/jwt.util"
		);
		vi.mocked(signRefreshToken).mockReturnValue("rotated-refresh-token");
		vi.mocked(verifyRefreshToken).mockReturnValue({
			userId: user._id.toString(),
			sessionId: session?._id.toString() ?? "",
			type: "refresh",
		});

		const refreshResponse = await request(app)
			.post("/api/v1/auth/refresh")
			.set("Cookie", loginResponse.headers["set-cookie"]);

		expect(refreshResponse.status).toBe(200);
		expect(refreshResponse.body).toMatchObject({
			success: true,
			message: "Token refreshed successfully",
			data: {
				accessToken: "test-access-token",
				refreshToken: "rotated-refresh-token",
			},
		});

		const updatedSession = await Session.findById(session?._id);
		expect(updatedSession).not.toBeNull();
		expect(
			await compareValue(
				"rotated-refresh-token",
				updatedSession?.tokenHash ?? "",
			),
		).toBe(true);
		expect(
			await compareValue("test-refresh-token", updatedSession?.tokenHash ?? ""),
		).toBe(false);
	});

	it("rejects the request when the refresh cookie is missing", async () => {
		const response = await request(app).post("/api/v1/auth/refresh");

		expect(response.status).toBe(401);
		expect(response.body).toMatchObject({
			message: "Refresh token is required",
		});
	});
});
