//! ============================================================
//! 🧪 Auth ServiceTest — Test suite for auth
//! ============================================================

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "@/config/resend.config";
import type { IUser } from "@/database/models/user.model";
import type { IVerification } from "@/database/models/verification.model";
import * as authRepository from "@/modules/auth/auth.repository";
import { register, verifyEmail } from "@/modules/auth/auth.service";
import * as verificationRepository from "@/modules/verification/verification.repository";
import type { EmailVerificationTokenPayload } from "@/schema/token-payload.schema";
import { generateMongooseObjectId } from "@/utils/index.util";
import {
	signEmailVerificationToken,
	verifyEmailVerificationToken,
} from "@/utils/jwt.util";

// Mock: Mock the appConfig module to provide a mock configuration for testing
vi.mock("@/config/app.config", () => ({
	appConfig: {
		APP_ORIGIN: "http://localhost:3000",
		JWT_EMAIL_VERIFICATION_EXPIRES_IN: "30m",
	},
}));

// Mock: Mock the dependencies used in the auth service
vi.mock("@/modules/auth/auth.repository", () => ({
	isUserExist: vi.fn(),
	create: vi.fn(),
	findById: vi.fn(),
}));

// Mock: Mock the verification repository
vi.mock("@/modules/verification/verification.repository", () => ({
	create: vi.fn(),
	findById: vi.fn(),
	deleteById: vi.fn(),
}));

// Mock: Mock the sendEmail function from the resend.config module
vi.mock("@/config/resend.config", () => ({
	sendEmail: vi.fn(),
}));

// Mock: Mock the signEmailVerificationToken function from the jwt.util module
vi.mock("@/utils/jwt.util", () => ({
	signEmailVerificationToken: vi.fn(),
	verifyEmailVerificationToken: vi.fn(),
}));

// Mock: Mock the generateMongooseObjectId function from the index.util module
vi.mock("@/utils/index.util", () => ({
	formatError: vi.fn(),
	generateMongooseObjectId: vi.fn(),
}));

//~ -----------------------------------------------------------------
//~ Spec:Auth Service  — Desc: Test cases for the auth service
//~ ----------------------------------------------------------------------
describe("Auth Service - register", () => {
	// Setup: Clear all mocks before each test case
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Test case for successful user registration
	it("should register a new user successfully", async () => {
		// Arrange: Sample user data for registration
		const userData = {
			email: "john@example.com",
			name: "John Doe",
			password: "Password123!",
		};

		// Arrange: Mock the dependencies
		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record
		const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Set expiration time for the verification token (30 minutes from now)

		// Arrange: Mock user and verification objects to be returned by the repository functions
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

		// Arrange: Mock verification object to be returned by the verification repository
		const mockVerification: IVerification = {
			_id: verificationId,
			userId: userId,
			tokenHash: "hashed-token",
			expiresAt,
		};

		// Mock: Mock the repository functions to return the mock user and verification objects
		vi.mocked(authRepository.isUserExist).mockResolvedValue(false);

		// Mock: Mock the create function of the auth repository to return the mock user
		vi.mocked(authRepository.create).mockResolvedValue(mockUser);

		// Mock: Mock the generateMongooseObjectId function to return the verificationId
		vi.mocked(generateMongooseObjectId).mockReturnValue(verificationId);

		// Mock: Mock the signEmailVerificationToken function to return a sample token
		vi.mocked(signEmailVerificationToken).mockReturnValue("verification-token");

		// Mock: Mock the create function of the verification repository to return the mock verification
		vi.mocked(verificationRepository.create).mockResolvedValue(
			mockVerification,
		);

		// Mock: Mock the sendEmail function to resolve with a sample email ID
		vi.mocked(sendEmail).mockResolvedValue({ id: "email-id" });

		// Act: Call the register function with the sample user data and store the result
		const result = await register(userData);

		// Assert: Assert that the service returns both the user and verification record
		expect(result).toEqual({
			user: mockUser,
			verification: mockVerification,
		});

		// Assert: Assert that the repository functions were called with the expected arguments
		expect(authRepository.isUserExist).toHaveBeenCalledWith(userData.email);

		// Assert: Assert that the create function of the auth repository was called with the expected user data
		expect(authRepository.create).toHaveBeenCalledWith({
			email: userData.email,
			name: userData.name,
			passwordHash: userData.password,
		});

		// Assert: Assert that the generateMongooseObjectId function was called
		expect(generateMongooseObjectId).toHaveBeenCalled();

		// Assert: Assert that the signEmailVerificationToken function was called with the expected arguments
		expect(signEmailVerificationToken).toHaveBeenCalledWith({
			userId: userId.toString(),
			type: "email_verification",
			verificationId: verificationId.toString(),
		});

		// Assert: Assert that the create function of the verification repository was called
		expect(verificationRepository.create).toHaveBeenCalled();

		// Assert: Assert that the sendEmail function was called with the expected arguments
		expect(sendEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: userData.email,
			}),
		);
	});

	// Test: Test case for user registration when the user already exists
	it("should throw an error if user already exists", async () => {
		// Arrange: Sample user data for registration
		const userData = {
			email: "john@example.com",
			name: "John Doe",
			password: "Password123!",
		};

		// Mock: Mock the isUserExist function to return true, indicating that the user already exists
		vi.mocked(authRepository.isUserExist).mockResolvedValue(true);

		// Act: Call the register function and assert that it throws an error indicating that the user already exists
		await expect(register(userData)).rejects.toThrow("User already exists");

		// Assert: Assert that the repository functions were called with the expected arguments
		expect(authRepository.isUserExist).toHaveBeenCalledWith(userData.email);

		// Assert: Assert that the create function of the auth repository was not called since the user already exists
		expect(authRepository.create).not.toHaveBeenCalled();

		// Assert: Assert that the generateMongooseObjectId function was not called since the user already exists
		expect(generateMongooseObjectId).not.toHaveBeenCalled();

		// Assert: Assert that the signEmailVerificationToken function was not called since the user already exists
		expect(verificationRepository.create).not.toHaveBeenCalled();

		// Assert: Assert that the sendEmail function was not called since the user already exists
		expect(sendEmail).not.toHaveBeenCalled();
	});
});

//~ -----------------------------------------------------------------
//~ Spec:Auth Service - verifyEmail — Desc: Test case for verifying a user's email
//~ -----------------------------------------------------------------
describe("Auth Service - verifyEmail", () => {
	// Setup: Clear all mocks before each test case
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Test case for successful email verification
	it("should verify the user's email successfully", async () => {
		// Arrange: Sample data for email verification
		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record
		const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Set expiration time for the verification token (30 minutes from now)

		// Data: Sample valid token for email verification
		const token = "valid-token"; // Sample valid token for email verification

		// Arrange: Mock the payload returned by the verifyEmailVerificationToken function
		const payload: EmailVerificationTokenPayload = {
			userId: userId.toString(),
			verificationId: verificationId.toString(),
			type: "email_verification",
		};

		// Arrange: Mock user and verification objects to be returned by the repository functions
		const user = {
			_id: userId,
			email: "john@example.com",
			name: "John Doe",
			passwordHash: "hashed-password",
			role: "CANDIDATE",
			isVerified: false,
			isActive: true,
			failedLoginAttempts: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
			comparePassword: vi.fn(),
			save: vi.fn().mockResolvedValue(undefined),
		} as unknown as Awaited<ReturnType<typeof authRepository.findById>>;

		// Arrange: Mock verification object to be returned by the verification repository
		const verification = {
			_id: verificationId,
			userId: userId,
			tokenHash: "hashed-token",
			expiresAt,
		} as unknown as Awaited<ReturnType<typeof verificationRepository.findById>>;

		// Mock: Mock the repository functions to return the mock user and verification objects
		vi.mocked(verifyEmailVerificationToken).mockReturnValue(payload);

		// Mock: Mock the findById function of the verification repository to return the mock verification
		vi.mocked(verificationRepository.findById).mockResolvedValue(verification);

		// Mock: Mock the findById function of the auth repository to return the mock user
		vi.mocked(authRepository.findById).mockResolvedValue(user);

		// Mock: Mock the deleteById function of the verification repository to resolve successfully
		vi.mocked(verificationRepository.deleteById).mockResolvedValue(
			verification,
		);

		// Act: Call the verifyEmail function with the sample token and store the result
		const result = await verifyEmail({ token: token });

		// Assert: Assert that the repository functions were called with the expected arguments
		expect(verifyEmailVerificationToken).toHaveBeenCalledWith(token);

		// Assert: Assert that the findById functions of the repositories were called with the expected IDs
		expect(verificationRepository.findById).toHaveBeenCalledWith(
			verificationId.toString(),
		);

		// Assert: Assert that the findById function of the auth repository was called with the expected user ID
		expect(authRepository.findById).toHaveBeenCalledWith(userId.toString());

		// Assert: Assert that the user's isVerified property was set to true and that the save method was called
		expect(user?.isVerified).toBe(true);

		// Assert: Assert that the deleteById function of the verification repository was called with the expected verification ID
		expect(user?.save).toHaveBeenCalledTimes(1);

		// Assert: Assert that the deleteById function of the verification repository was called with the expected verification ID
		expect(verificationRepository.deleteById).toHaveBeenCalledWith(
			verificationId.toString(),
		);

		// Assert: Assert that the result returned by the verifyEmail function contains both the user and verification record
		expect(result).toEqual({ user, verification });
	});

	// Test: Test case for email verification when the token type is invalid
	it("should throw an error when the token type is invalid", async () => {
		// Data: Sample token for email verification with an invalid type
		const token = "invalid-token"; // Sample token with an invalid type for email verification

		// Mock: Mock the payload returned by the verifyEmailVerificationToken function with an invalid type
		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: "some-user-id",
			verificationId: "some-verification-id",
			type: "invalid_type",
		} as unknown as EmailVerificationTokenPayload);

		// Act: Call the verifyEmail function and assert that it throws an error indicating that the verification token type is invalid
		await expect(verifyEmail({ token })).rejects.toThrow(
			"Invalid verification token type",
		);

		// Assert: Assert that the repository functions were not called since the token type is invalid
		expect(verificationRepository.findById).not.toHaveBeenCalled();

		// Assert: Assert that the auth repository's findById function was not called since the token type is invalid
		expect(authRepository.findById).not.toHaveBeenCalled();
	});

	// Test: Test case for email verification when the verification record does not exist
	it("should throww an error when the verification record does not exist", async () => {
		// Arrange: Sample data for email verification
		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record

		// Data: Sample token for email verification that does not correspond to any existing verification record
		const token = "non-existent-verification-token"; // Sample token for email verification that does not correspond to any existing verification record

		// Mock: Mock the payload returned by the verifyEmailVerificationToken function
		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: userId.toString(),
			verificationId: verificationId.toString(),
			type: "email_verification",
		} as unknown as EmailVerificationTokenPayload);

		// Mock: Mock the findById function of the verification repository to return null, indicating that the verification record does not exist
		vi.mocked(verificationRepository.findById).mockResolvedValue(null);

		// Act: Call the verifyEmail function and assert that it throws an error indicating that the verification token is invalid
		await expect(verifyEmail({ token })).rejects.toThrow(
			"Invalid verification token",
		);

		// Assert: Assert that the findById function of the verification repository was called with the expected verification ID
		expect(verificationRepository.findById).toHaveBeenCalledWith(
			verificationId.toString(),
		);

		// Assert: Assert that the auth repository's findById function was not called since the verification record does not exist
		expect(authRepository.findById).not.toHaveBeenCalled();
	});

	// Test: Test case for email verification when the verification record belongs to another user
	it("should throw an error when the verification record belongs to another user", async () => {
		// Arrange: Sample data for email verification
		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const anotherUserId = new Types.ObjectId(); // Generate a new ObjectId for another user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record

		// Data: Sample token for email verification that corresponds to a verification record belonging to another user
		const token = "mismatched-user-verification-token"; // Sample token for email verification that corresponds to a verification record belonging to another user

		// Mock: Mock the payload returned by the verifyEmailVerificationToken function
		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: userId.toString(),
			verificationId: verificationId.toString(),
			type: "email_verification",
		} as unknown as EmailVerificationTokenPayload);

		// Mock: Mock the findById function of the verification repository to return a verification record that belongs to another user
		const verification = {
			_id: verificationId,
			userId: anotherUserId, // Mismatched user ID
			tokenHash: "hashed-token",
			expiresAt: new Date(Date.now() + 30 * 60 * 1000),
		} as unknown as Awaited<ReturnType<typeof verificationRepository.findById>>;

		// MOCK: Mock the findById function of the verification repository to return the mismatched verification record
		vi.mocked(verificationRepository.findById).mockResolvedValue(verification);

		// Act: Call the verifyEmail function and assert that it throws an error indicating that the verification token is invalid
		await expect(verifyEmail({ token })).rejects.toThrow(
			"Invalid verification token",
		);

		// Assert: Assert that the findById function of the verification repository was called with the expected verification ID
		expect(verificationRepository.findById).toHaveBeenCalledWith(
			verificationId.toString(),
		);

		// Assert: Assert that the auth repository's findById function was not called since the verification record belongs to another user
		expect(authRepository.findById).not.toHaveBeenCalled();
	});

	// Test: Test case for email verification when the verification token has expired
	it("should throw an error when the verification token has expired", async () => {
		// Arrange: Sample data for email verification
		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record

		// Data: Sample token for email verification that corresponds to an expired verification record
		const token = "expired-verification-token"; // Sample token for email verification that corresponds to an expired verification record

		// Mock: Mock the payload returned by the verifyEmailVerificationToken function
		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: userId.toString(),
			verificationId: verificationId.toString(),
			type: "email_verification",
		} as unknown as EmailVerificationTokenPayload);

		// Arrange: Mock the findById function of the verification repository to return a verification record that has expired
		const verification = {
			_id: verificationId,
			userId: userId,
			tokenHash: "hashed-token",
			expiresAt: new Date(Date.now() - 1000), // Set expiration time in the past
		} as unknown as Awaited<ReturnType<typeof verificationRepository.findById>>;

		// MOCK: Mock the findById function of the verification repository to return the expired verification record
		vi.mocked(verificationRepository.findById).mockResolvedValue(verification);

		// Act: Call the verifyEmail function and assert that it throws an error indicating that the verification token has expired
		await expect(verifyEmail({ token })).rejects.toThrow(
			"Verification token has expired",
		);

		// Assert: Assert that the findById function of the verification repository was called with the expected verification ID
		expect(verificationRepository.findById).toHaveBeenCalledWith(
			verificationId.toString(),
		);
	});

	// Test: Test case for email verification when the user does not exist
	it("should throw an error when the user does not exist", async () => {
		// Arrange: Sample data for email verification
		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record

		// Data: Sample token for email verification that corresponds to a verification record for a non-existent user
		const token = "non-existent-user-verification-token"; // Sample token for email verification that corresponds to a verification record for a non-existent user

		// Mock: Mock the payload returned by the verifyEmailVerificationToken function
		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: userId.toString(),
			verificationId: verificationId.toString(),
			type: "email_verification",
		} as unknown as EmailVerificationTokenPayload);

		// Arrange: Mock the findById function of the verification repository to return a valid verification record
		const verification = {
			_id: verificationId,
			userId: userId,
			tokenHash: "hashed-token",
			expiresAt: new Date(Date.now() + 30 * 60 * 1000),
		} as unknown as Awaited<ReturnType<typeof verificationRepository.findById>>;

		// Mock: Mock the findById function of the verification repository to return the valid verification record
		vi.mocked(verificationRepository.findById).mockResolvedValue(verification);

		// Mock: Mock the findById function of the auth repository to return null, indicating that the user does not exist
		vi.mocked(authRepository.findById).mockResolvedValue(null);

		// Act: Call the verifyEmail function and assert that it throws an error indicating that the user does not exist for verification
		await expect(verifyEmail({ token })).rejects.toThrow(
			"User not found for verification",
		);

		// Assert: Assert that the findById function of the verification repository was called with the expected verification ID
		expect(verificationRepository.findById).toHaveBeenCalledWith(
			verificationId.toString(),
		);

		// Assert: Assert that the findById function of the auth repository was called with the expected user ID
		expect(authRepository.findById).toHaveBeenCalledWith(userId.toString());
	});

	// Test: Test case for email verification when the user is already verified
	it("should throw an error when the user is already verified", async () => {
		// Arrange: Sample data for email verification
		const userId = new Types.ObjectId(); // Generate a new ObjectId for the user
		const verificationId = new Types.ObjectId(); // Generate a new ObjectId for the verification record

		// Data: Sample token for email verification that corresponds to a verification record for an already verified user
		const token = "already-verified-user-verification-token"; // Sample token for email verification that corresponds to a verification record for an already verified user

		// Mock: Mock the payload returned by the verifyEmailVerificationToken function
		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: userId.toString(),
			verificationId: verificationId.toString(),
			type: "email_verification",
		} as unknown as EmailVerificationTokenPayload);

		// Arrange: Mock the findById function of the verification repository to return a valid verification record
		const verification = {
			_id: verificationId,
			userId: userId,
			tokenHash: "hashed-token",
			expiresAt: new Date(Date.now() + 30 * 60 * 1000),
		} as unknown as Awaited<ReturnType<typeof verificationRepository.findById>>;

		// Arrange: Mock user object to be returned by the auth repository's findById function, indicating that the user is already verified
		const user = {
			_id: userId,
			email: "user@example.com",
			isVerified: true,
			save: vi.fn(),
		} as unknown as Awaited<ReturnType<typeof authRepository.findById>>;

		// Mock: Mock the findById function of the verification repository to return the valid verification record
		vi.mocked(verificationRepository.findById).mockResolvedValue(verification);

		// Arrange: Mock the findById function of the auth repository to return the already verified user
		vi.mocked(authRepository.findById).mockResolvedValue(user);

		// Act: Call the verifyEmail function and assert that it throws an error indicating that the user is already verified
		await expect(verifyEmail({ token })).rejects.toThrow(
			"User is already verified",
		);

		// Assert: Assert that the findById function of the verification repository was called with the expected verification ID
		expect(verificationRepository.findById).toHaveBeenCalledWith(
			verificationId.toString(),
		);

		// Assert: Assert that the findById function of the auth repository was called with the expected user ID
		expect(authRepository.findById).toHaveBeenCalledWith(userId.toString());
	});
});
