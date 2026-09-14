//! ============================================================
//! 🧪 Auth ServiceTest — Test suite for auth
//! ============================================================

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "@/config/resend.config";
import type { IUser } from "@/database/models/user.model";
import type { IVerification } from "@/database/models/verification.model";
import * as authRepository from "@/modules/auth/auth.repository";
import { register } from "@/modules/auth/auth.service";
import * as verificationRepository from "@/modules/verification/verification.repository";
import { generateMongooseObjectId } from "@/utils/index.util";
import { signEmailVerificationToken } from "@/utils/jwt.util";

// Info: Mock application settings so this unit test does not require infrastructure secrets
vi.mock("@/config/app.config", () => ({
	appConfig: {
		APP_ORIGIN: "http://localhost:3000",
		JWT_EMAIL_VERIFICATION_EXPIRES_IN: "30m",
	},
}));

// Info: Mock the dependencies used in the auth service
vi.mock("@/modules/auth/auth.repository", () => ({
	isUserExist: vi.fn(),
	create: vi.fn(),
}));

// Info: Mock the verification repository
vi.mock("@/modules/verification/verification.repository", () => ({
	create: vi.fn(),
}));

// Info: Mock the sendEmail function from the resend.config module
vi.mock("@/config/resend.config", () => ({
	sendEmail: vi.fn(),
}));

// Info: Mock the signEmailVerificationToken function from the jwt.util module
vi.mock("@/utils/jwt.util", () => ({
	signEmailVerificationToken: vi.fn(),
}));

// Info: Mock the generateMongooseObjectId function from the index.util module
vi.mock("@/utils/index.util", () => ({
	formatError: vi.fn(),
	generateMongooseObjectId: vi.fn(),
}));

// Info: Test suite for the register function in the auth service
describe("Auth Service - register", () => {
	// Info: Clear all mocks before each test case
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Info: Test case for successful user registration
	it("should register a new user successfully", async () => {
		// Info: Sample user data for registration
		const userData = {
			email: "john@example.com",
			name: "John Doe",
			password: "Password123!",
		};

		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record
		const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Set expiration time for the verification token (30 minutes from now)

		// Info: Mock user and verification objects to be returned by the repository functions
		const mockUser: IUser = {
			_id: userId,
			email: userData.email,
			name: userData.name,
			passwordHash: "hashed-password",
			role: "CANDIDATE",
			isVerified: false,
			isActive: true,
			failedLoginAttempts: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
			comparePassword: vi.fn(),
		};

		// Info: Mock verification object to be returned by the verification repository
		const mockVerification: IVerification = {
			_id: verificationId,
			userId: userId,
			tokenHash: "hashed-token",
			expiresAt,
		};

		// Info: Mock the repository functions to return the mock user and verification objects
		vi.mocked(authRepository.isUserExist).mockResolvedValue(false);

		// Info: Mock the create function of the auth repository to return the mock user
		vi.mocked(authRepository.create).mockResolvedValue(mockUser);

		// Info: Mock the generateMongooseObjectId function to return the verificationId
		vi.mocked(generateMongooseObjectId).mockReturnValue(verificationId);

		// Info: Mock the signEmailVerificationToken function to return a sample token
		vi.mocked(signEmailVerificationToken).mockReturnValue("verification-token");

		// Info: Mock the create function of the verification repository to return the mock verification
		vi.mocked(verificationRepository.create).mockResolvedValue(
			mockVerification,
		);

		// Info: Mock the sendEmail function to resolve with a sample email ID
		vi.mocked(sendEmail).mockResolvedValue({ id: "email-id" });

		// Info: Call the register function with the sample user data and store the result
		const result = await register(userData);

		// Info: Assert that the result matches the mock user object
		expect(result).toEqual(mockUser);

		// Info: Assert that the repository functions were called with the expected arguments
		expect(authRepository.isUserExist).toHaveBeenCalledWith(userData.email);

		// Info: Assert that the create function of the auth repository was called with the expected user data
		expect(authRepository.create).toHaveBeenCalledWith({
			email: userData.email,
			name: userData.name,
			passwordHash: userData.password,
		});

		// Info: Assert that the generateMongooseObjectId function was called
		expect(generateMongooseObjectId).toHaveBeenCalled();

		// Info: Assert that the signEmailVerificationToken function was called with the expected arguments
		expect(signEmailVerificationToken).toHaveBeenCalledWith({
			userId: userId.toString(),
			type: "email_verification",
			verificationId: verificationId.toString(),
		});

		// Info: Assert that the create function of the verification repository was called
		expect(verificationRepository.create).toHaveBeenCalled();

		// Info: Assert that the sendEmail function was called with the expected arguments
		expect(sendEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: userData.email,
			}),
		);
	});

	// Info: Test case for user registration when the user already exists
	it("should throw an error if user already exists", async () => {
		// Info: Sample user data for registration
		const userData = {
			email: "john@example.com",
			name: "John Doe",
			password: "Password123!",
		};

		// Info: Mock the isUserExist function to return true, indicating that the user already exists
		vi.mocked(authRepository.isUserExist).mockResolvedValue(true);

		// Info: Call the register function and assert that it throws an error indicating that the user already exists
		await expect(register(userData)).rejects.toThrow("User already exists");

		// Info: Assert that the repository functions were called with the expected arguments
		expect(authRepository.isUserExist).toHaveBeenCalledWith(userData.email);

		// Info: Assert that the create function of the auth repository was not called since the user already exists
		expect(authRepository.create).not.toHaveBeenCalled();

		// Info: Assert that the generateMongooseObjectId function was not called since the user already exists
		expect(generateMongooseObjectId).not.toHaveBeenCalled();

		// Info: Assert that the signEmailVerificationToken function was not called since the user already exists
		expect(verificationRepository.create).not.toHaveBeenCalled();

		// Info: Assert that the sendEmail function was not called since the user already exists
		expect(sendEmail).not.toHaveBeenCalled();
	});
});
