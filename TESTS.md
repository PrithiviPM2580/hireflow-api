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

import { beforeEach, describe, expect, it, vi } from "vitest";

import { verifyEmail } from "@/modules/auth/auth.service";
import { authRepository } from "@/modules/auth/auth.repository";
import { verificationRepository } from "@/modules/auth/verification.repository";
import { verifyEmailVerificationToken } from "@/utils/jwt";

// Mock dependencies
vi.mock("@/modules/auth/auth.repository", () => ({
	authRepository: {
		findById: vi.fn(),
	},
}));

vi.mock("@/modules/auth/verification.repository", () => ({
	verificationRepository: {
		findById: vi.fn(),
		deleteById: vi.fn(),
	},
}));

vi.mock("@/utils/jwt", () => ({
	verifyEmailVerificationToken: vi.fn(),
}));

describe("verifyEmail()", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should verify the user's email successfully", async () => {
		const userId = "65abc123456789abcdef1234";
		const verificationId = "65def123456789abcdef5678";

		const token = "valid-verification-token";

		const payload = {
			userId,
			verificationId,
			type: "email_verification",
		};

		const user = {
			_id: userId,
			email: "test@example.com",
			isVerified: false,
			save: vi.fn().mockResolvedValue(undefined),
		};

		const verification = {
			_id: verificationId,
			userId,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
		};

		vi.mocked(verifyEmailVerificationToken).mockReturnValue(payload);

		vi.mocked(verificationRepository.findById).mockResolvedValue(
			verification as any,
		);

		vi.mocked(authRepository.findById).mockResolvedValue(
			user as any,
		);

		vi.mocked(verificationRepository.deleteById).mockResolvedValue(
			verification as any,
		);

		const result = await verifyEmail({
			token,
		});

		expect(verifyEmailVerificationToken).toHaveBeenCalledWith(token);

		expect(verificationRepository.findById).toHaveBeenCalledWith(
			verificationId,
		);

		expect(authRepository.findById).toHaveBeenCalledWith(userId);

		expect(user.isVerified).toBe(true);

		expect(user.save).toHaveBeenCalledTimes(1);

		expect(
			verificationRepository.deleteById,
		).toHaveBeenCalledWith(verificationId);

		expect(result).toEqual({
			user,
			verification,
		});
	});

	it("should throw an error when the token type is invalid", async () => {
		const token = "invalid-type-token";

		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId: "65abc123456789abcdef1234",
			verificationId: "65def123456789abcdef5678",
			type: "wrong_type",
		} as any);

		await expect(
			verifyEmail({
				token,
			}),
		).rejects.toThrow("Invalid verification token type");

		expect(verificationRepository.findById).not.toHaveBeenCalled();

		expect(authRepository.findById).not.toHaveBeenCalled();
	});

	it("should throw an error when the verification record does not exist", async () => {
		const userId = "65abc123456789abcdef1234";
		const verificationId = "65def123456789abcdef5678";

		const token = "invalid-token";

		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId,
			verificationId,
			type: "email_verification",
		});

		vi.mocked(verificationRepository.findById).mockResolvedValue(
			null,
		);

		await expect(
			verifyEmail({
				token,
			}),
		).rejects.toThrow("Invalid verification token");

		expect(
			verificationRepository.findById,
		).toHaveBeenCalledWith(verificationId);

		expect(authRepository.findById).not.toHaveBeenCalled();
	});

	it("should throw an error when the verification record belongs to another user", async () => {
		const userId = "65abc123456789abcdef1234";
		const anotherUserId = "65fff123456789abcdef9999";
		const verificationId = "65def123456789abcdef5678";

		const token = "mismatched-token";

		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId,
			verificationId,
			type: "email_verification",
		});

		vi.mocked(verificationRepository.findById).mockResolvedValue({
			_id: verificationId,
			userId: anotherUserId,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
		} as any);

		await expect(
			verifyEmail({
				token,
			}),
		).rejects.toThrow("Invalid verification token");

		expect(authRepository.findById).not.toHaveBeenCalled();
	});

	it("should throw an error when the verification token has expired", async () => {
		const userId = "65abc123456789abcdef1234";
		const verificationId = "65def123456789abcdef5678";

		const token = "expired-token";

		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId,
			verificationId,
			type: "email_verification",
		});

		vi.mocked(verificationRepository.findById).mockResolvedValue({
			_id: verificationId,
			userId,
			expiresAt: new Date(Date.now() - 10 * 60 * 1000),
		} as any);

		await expect(
			verifyEmail({
				token,
			}),
		).rejects.toThrow("Verification token has expired");

		expect(authRepository.findById).not.toHaveBeenCalled();
	});

	it("should throw an error when the user does not exist", async () => {
		const userId = "65abc123456789abcdef1234";
		const verificationId = "65def123456789abcdef5678";

		const token = "valid-token";

		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId,
			verificationId,
			type: "email_verification",
		});

		vi.mocked(verificationRepository.findById).mockResolvedValue({
			_id: verificationId,
			userId,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
		} as any);

		vi.mocked(authRepository.findById).mockResolvedValue(null);

		await expect(
			verifyEmail({
				token,
			}),
		).rejects.toThrow("User not found for verification");

		expect(authRepository.findById).toHaveBeenCalledWith(userId);

		expect(verificationRepository.deleteById).not.toHaveBeenCalled();
	});

	it("should throw an error when the user is already verified", async () => {
		const userId = "65abc123456789abcdef1234";
		const verificationId = "65def123456789abcdef5678";

		const token = "already-verified-token";

		vi.mocked(verifyEmailVerificationToken).mockReturnValue({
			userId,
			verificationId,
			type: "email_verification",
		});

		vi.mocked(verificationRepository.findById).mockResolvedValue({
			_id: verificationId,
			userId,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
		} as any);

		const user = {
			_id: userId,
			email: "test@example.com",
			isVerified: true,
			save: vi.fn(),
		};

		vi.mocked(authRepository.findById).mockResolvedValue(
			user as any,
		);

		await expect(
			verifyEmail({
				token,
			}),
		).rejects.toThrow("User is already verified");

		expect(user.save).not.toHaveBeenCalled();

		expect(
			verificationRepository.deleteById,
		).not.toHaveBeenCalled();
	});
});
