import "../../setup";

import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import app from "@/app";
import User from "@/database/models/user.model";
import Verification from "@/database/models/verification.model";

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
		EMAIL_FROM: "test@example.com",
	},
}));

vi.mock("@/config/resend.config", () => ({
	sendEmail: vi.fn().mockResolvedValue({ id: "test-email-id" }),
}));

vi.mock("@/utils/jwt.util", () => ({
	signEmailVerificationToken: vi
		.fn()
		.mockReturnValue("test-verification-token"),
}));

describe("POST /api/v1/auth/register", () => {
	afterEach(async () => {
		await User.deleteMany({});
		await Verification.deleteMany({});
	});

	it("registers a user and creates an email verification record", async () => {
		const response = await request(app).post("/api/v1/auth/register").send({
			name: "John Doe",
			email: "john@example.com",
			password: "Password123!",
		});

		expect(response.status).toBe(201);
		expect(response.body).toMatchObject({
			success: true,
			message: "User created successfully",
		});
		expect(response.body.data).toMatchObject({
			user: {
				name: "John Doe",
				email: "john@example.com",
				isVerified: false,
			},
		});

		const user = await User.findOne({ email: "john@example.com" }).lean();
		const verification = await Verification.findOne({
			userId: user?._id,
		}).lean();

		expect(user).not.toBeNull();
		expect(user?.passwordHash).not.toBe("Password123!");
		expect(verification).not.toBeNull();
		expect(verification?.tokenHash).not.toBe("test-verification-token");
		expect(verification?.userId.toString()).toBe(user?._id.toString());
	});

	it("rejects registration when the email already exists", async () => {
		await User.create({
			name: "Existing User",
			email: "john@example.com",
			passwordHash: "Password123!",
		});

		const response = await request(app).post("/api/v1/auth/register").send({
			name: "John Doe",
			email: "john@example.com",
			password: "Password123!",
		});

		expect(response.status).toBe(400);
		expect(response.body).toMatchObject({
			message: "User already exists",
		});
	});
});
