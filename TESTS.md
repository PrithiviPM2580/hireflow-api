import { beforeEach, describe, expect, it, vi } from "vitest";

import { login } from "@/services/auth.service";
import { authRepository } from "@/repositories/auth.repository";
import { sessionRepository } from "@/repositories/session.repository";
import {
	signAccessToken,
	signRefreshToken,
} from "@/utils/token";
import { generateMongooseObjectId } from "@/utils/mongoose";
import { appConfig } from "@/config";
import { ApiError } from "@/utils/ApiError";

// Mock dependencies
vi.mock("@/repositories/auth.repository", () => ({
	authRepository: {
		findByEmail: vi.fn(),
	},
}));

vi.mock("@/repositories/session.repository", () => ({
	sessionRepository: {
		create: vi.fn(),
	},
}));

vi.mock("@/utils/token", () => ({
	signAccessToken: vi.fn(),
	signRefreshToken: vi.fn(),
}));

vi.mock("@/utils/mongoose", () => ({
	generateMongooseObjectId: vi.fn(),
}));

vi.mock("@/config", () => ({
	appConfig: {
		JWT_REFRESH_EXPIRES_IN: "7d",
	},
}));

describe("AuthService.login", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should login successfully with valid credentials", async () => {
		// Arrange
		const user = {
			_id: "user123",
			email: "john@example.com",
			isVerified: true,
			comparePassword: vi.fn(),
		};

		user.comparePassword.mockResolvedValue(true);

		const sessionId = {
			toString: () => "session123",
		};

		const session = {
			_id: "session123",
			userId: "user123",
			tokenHash: "refresh-token",
		};

		vi.mocked(authRepository.findByEmail).mockResolvedValue(
			user as any,
		);

		vi.mocked(generateMongooseObjectId).mockReturnValue(
			sessionId as any,
		);

		vi.mocked(signAccessToken).mockReturnValue(
			"access-token",
		);

		vi.mocked(signRefreshToken).mockReturnValue(
			"refresh-token",
		);

		vi.mocked(sessionRepository.create).mockResolvedValue(
			session as any,
		);

		const loginData = {
			email: "john@example.com",
			password: "password123",
		};

		// Act
		const result = await login(loginData);

		// Assert
		expect(authRepository.findByEmail).toHaveBeenCalledWith(
			"john@example.com",
		);

		expect(user.comparePassword).toHaveBeenCalledWith(
			"password123",
		);

		expect(generateMongooseObjectId).toHaveBeenCalled();

		expect(signAccessToken).toHaveBeenCalledWith({
			userId: "user123",
			sessionId: "session123",
			type: "access",
		});

		expect(signRefreshToken).toHaveBeenCalledWith({
			userId: "user123",
			sessionId: "session123",
			type: "refresh",
		});

		expect(sessionRepository.create).toHaveBeenCalled();

		expect(result).toEqual({
			user,
			session,
			accessToken: "access-token",
			refreshToken: "refresh-token",
		});
	});
});
