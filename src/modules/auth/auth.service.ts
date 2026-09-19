//! ============================================================
//! 🔧 Auth Service — Business logic of authentication
//! ============================================================

import ms, { type StringValue } from "ms";
import { appConfig } from "@/config/app.config";
import { sendEmail } from "@/config/resend.config";
import * as sessionRepository from "@/modules/session/session.repository";
import * as verificationRepository from "@/modules/verification/verification.repository";
import { ApiError } from "@/utils/api-error.util";
import { verificationEmailTemplate } from "@/utils/email-template.util";
import { generateMongooseObjectId } from "@/utils/index.util";
import {
	signAccessToken,
	signEmailVerificationToken,
	signRefreshToken,
	verifyEmailVerificationToken,
	verifyRefreshToken,
} from "@/utils/jwt.util";
import logger from "@/utils/logger.util";
import * as authRepository from "./auth.repository";
import type {
	LoginInput,
	RegisterInput,
	VerifyEmailQuery,
} from "./auth.schema";

//> -----------------------------------------------------------------
//> Fn:register() — Desc: Register a new user service
//> -----------------------------------------------------------------
export const register = async (userData: RegisterInput["body"]) => {
	// Info: Destructure user data
	const { email, name, password } = userData;

	// Info: Check if the user already exists
	const isUserExist = await authRepository.isUserExist(email);

	// Info: If the user exists, throw a bad request error
	if (isUserExist) {
		// Error: Log the error indicating that the user already exists
		logger.error("User already exists", {
			label: "AuthService",
			email,
		});

		// Error: Throw a bad request error indicating that the user already exists
		throw ApiError.badRequest("User already exists");
	}

	// Info: Create a new user in the database
	const user = await authRepository.create({
		email,
		name,
		passwordHash: password,
	});

	// Info: Generate a new ObjectId for the verification record
	const verificationId = generateMongooseObjectId();

	// Info: Sign an email verification token for the newly created user
	const verificationToken = signEmailVerificationToken({
		userId: user._id.toString(),
		type: "email_verification",
		verificationId: verificationId.toString(),
	});

	// Info: Calculate the expiration date for the verification token
	const expiresAt = new Date(
		Date.now() + ms(appConfig.JWT_EMAIL_VERIFICATION_EXPIRES_IN as StringValue),
	);

	// Info: Create a new verification record in the database for the newly created user
	const verification = await verificationRepository.create({
		_id: verificationId,
		userId: user._id,
		tokenHash: verificationToken,
		expiresAt: expiresAt,
	});

	// Info: Construct the verification URL to be sent in the email
	const verificationUrl = `${appConfig.APP_ORIGIN}/api/v1/auth/verify-email?token=${verificationToken}`;

	// Info: Generate the email template for the verification email
	const emailTemplate = verificationEmailTemplate({
		verificationUrl,
	});

	// Info: Send the verification email to the newly registered user
	await sendEmail({
		to: email,
		...emailTemplate,
	});

	// Info: Return the newly created user
	return {
		verification,
		user,
	};
};

//> -----------------------------------------------------------------
//> Fn:verifyEmail() — Desc: Verify the email of a user service
//> -----------------------------------------------------------------
export const verifyEmail = async (query: VerifyEmailQuery["query"]) => {
	// Info: Destructure the verification token from the query parameters
	const { token } = query;

	// Info: Verify the email verification token and extract the payload
	const payload = verifyEmailVerificationToken(token);

	// Info: Check if the token type is "email_verification"
	if (payload.type !== "email_verification") {
		// Error: Log the error indicating that the verification token type is invalid
		logger.error("Invalid verification token type", {
			label: "AuthService",
			token,
		});
		// Error: Throw a bad request error indicating that the verification token type is invalid
		throw ApiError.badRequest("Invalid verification token type");
	}

	// Info: Destructure the userId and verificationId from the payload
	const { userId, verificationId } = payload;

	// Info: Find the verification record by its ID
	const verification = await verificationRepository.findById(verificationId);

	// Info: Check if the verification record exists and if the userId matches
	if (!verification || verification.userId.toString() !== userId) {
		// Error: Log the error indicating that the verification token is invalid
		logger.error("Invalid verification token", {
			label: "AuthService",
			token,
		});
		// Error: Throw a bad request error indicating that the verification token is invalid
		throw ApiError.badRequest("Invalid verification token");
	}

	// Info: Check if the verification token has expired
	if (verification.expiresAt.getTime() < Date.now()) {
		// Error: Log the error indicating that the verification token has expired
		logger.error("Verification token has expired", {
			label: "AuthService",
			token,
		});
		// Error: Throw a bad request error indicating that the verification token has expired
		throw ApiError.badRequest("Verification token has expired");
	}

	// Info: Find the user by their ID
	const user = await authRepository.findById(userId);

	// Info: Check if the user exists
	if (!user) {
		// Error: Log the error indicating that the user was not found for verification
		logger.error("User not found for verification", {
			label: "AuthService",
			userId,
		});
		// Error: Throw a not found error indicating that the user was not found for verification
		throw ApiError.notFound("User not found for verification");
	}

	// Info: Check if the user is already verified
	if (user.isVerified) {
		// Error: Log the error indicating that the user is already verified
		logger.error("User is already verified", {
			label: "AuthService",
			userId,
		});

		// Error: Throw a bad request error indicating that the user is already verified
		throw ApiError.badRequest("User is already verified");
	}

	// Info: Mark the user as verified and save the changes to the database
	user.isVerified = true;

	// Info: Save the updated user record to the database
	await user.save();

	// Info: Delete the verification record from the database after successful verification
	await verificationRepository.deleteById(verificationId);

	// Info: Return the verified user and the verification record
	return {
		user,
		verification,
	};
};

//> -----------------------------------------------------------------
//> Fn:login() — Desc: Login a user service
//> -----------------------------------------------------------------
export const login = async (userData: LoginInput["body"]) => {
	// Info: Destructure the email and password from the user data
	const { email, password } = userData;

	// Info: Find the user by their email address
	const user = await authRepository.findByEmail(email);

	// Info: If the user is not found, log an error and throw a not found error
	if (!user) {
		// Error: Log the error indicating that the user was not found
		logger.error("User not found", {
			label: "AuthService",
			email,
		});
		// Error: Throw a not found error indicating that the user was not found
		throw ApiError.notFound("User not found");
	}

	// Info: If the user's email is not verified, log an error and throw an unauthorized error
	if (!user.isVerified) {
		// Error: Log the error indicating that the user's email is not verified
		logger.error("User email is not verified", {
			label: "AuthService",
			email,
		});
		// Error: Throw an unauthorized error indicating that the user's email is not verified
		throw ApiError.unauthorized("User email is not verified");
	}

	// Info: If the user's account is not active, log an error and throw an unauthorized error
	const isPasswordValid = await user.comparePassword(password);

	// Info: If the password is invalid, log an error and throw an unauthorized error
	if (!isPasswordValid) {
		// Error: Log the error indicating that the password is invalid
		logger.error("Invalid password", {
			label: "AuthService",
			email,
		});
		// Error: Throw an unauthorized error indicating that the password is invalid
		throw ApiError.unauthorized("Invalid password");
	}

	// Info: Generate a new ObjectId for the session
	const sessionId = generateMongooseObjectId();

	// Info: Sign an access token for the user with the session ID
	const accessToken = signAccessToken({
		userId: user._id.toString(),
		sessionId: sessionId.toString(),
		type: "access",
	});

	// Info: Sign a refresh token for the user with the session ID
	const refreshToken = signRefreshToken({
		userId: user._id.toString(),
		sessionId: sessionId.toString(),
		type: "refresh",
	});

	// Info: Calculate the expiration date for the refresh token
	const expiresAt = new Date(
		Date.now() + ms(appConfig.JWT_REFRESH_EXPIRES_IN as StringValue),
	);

	// Info: Create a new session record in the database for the user
	const session = await sessionRepository.create({
		_id: sessionId,
		userId: user._id,
		tokenHash: refreshToken,
		expiresAt,
	});

	// Info: Return the user, session, access token, and refresh token
	return {
		user,
		session,
		accessToken,
		refreshToken,
	};
};

//> -----------------------------------------------------------------
//> Fn:refresh() — Desc: Create a new access token from a refresh token
//> -----------------------------------------------------------------
export const refresh = async (refreshToken: string) => {
	// Info: Verify the refresh token and extract the payload
	const payload = verifyRefreshToken(refreshToken);

	// Info: Check if the token type is "refresh"
	const session = await sessionRepository.findById(payload.sessionId);

	if (!session) {
		// Error: Log the error indicating that the session was not found for the refresh token
		logger.error("Session not found", {
			label: "AuthService",
			sessionId: payload.sessionId,
		});
		// Error: Throw an unauthorized error indicating that the session was not found for the refresh token
		throw ApiError.unauthorized("Session not found");
	}

	// Info: Check if the userId in the session matches the userId in the payload
	if (session.userId.toString() !== payload.userId) {
		// Error: Log the error indicating that the session userId does not match the payload userId
		logger.error("Session userId does not match payload userId", {
			label: "AuthService",
			sessionId: payload.sessionId,
			userId: payload.userId,
		});
		// Error: Log the error indicating that the session userId does not match the payload userId
		throw ApiError.unauthorized("Invalid refresh token");
	}

	// Info: Compare the provided refresh token with the hashed token stored in the session
	const isTokenValid = await session.compareToken(refreshToken);

	// Info: If the token is not valid, log an error and throw an unauthorized error
	if (!isTokenValid) {
		// Error: Log the error indicating that the refresh token is invalid
		logger.error("Invalid refresh token", {
			label: "AuthService",
			sessionId: payload.sessionId,
		});
		// Error: Throw an unauthorized error indicating that the refresh token is invalid
		throw ApiError.unauthorized("Invalid refresh token");
	}

	// Info: Find the user by their ID
	const user = await authRepository.findById(payload.userId);

	// Info: If the user is not found, log an error and throw an unauthorized error
	if (!user) {
		// Error: Log the error indicating that the user was not found for the refresh token
		logger.error("User not found", {
			label: "AuthService",
			userId: payload.userId,
		});
		// Error: Throw an unauthorized error indicating that the user was not found for the refresh token
		throw ApiError.unauthorized("User not found");
	}

	// Info: Check if the session has expired
	const isSessionExpired = session.expiresAt.getTime() < Date.now();

	// Info: If the session has expired, log an error and throw an unauthorized error
	if (isSessionExpired) {
		// Error: Log the error indicating that the session has expired
		logger.error("Session has expired", {
			label: "AuthService",
			sessionId: payload.sessionId,
		});
		// Error: Throw an unauthorized error indicating that the session has expired
		throw ApiError.unauthorized("Session has expired");
	}

	// Info: Check if the user account is active and verified
	if (!user.isActive) {
		// Error: Log the error indicating that the user account is not active
		logger.error("User account is not active", {
			label: "AuthService",
			userId: payload.userId,
		});
		// Error: Throw an unauthorized error indicating that the user account is not active
		throw ApiError.unauthorized("User account is not active");
	}

	// Info: Check if the user email is verified
	if (!user.isVerified) {
		// Error: Log the error indicating that the user email is not verified
		logger.error("User email is not verified", {
			label: "AuthService",
			userId: payload.userId,
		});
		// Error: Throw an unauthorized error indicating that the user email is not verified
		throw ApiError.unauthorized("User email is not verified");
	}

	// Info: Check if the session has been revoked
	const isSessionRevoked = session.revokedAt !== null;

	// Info: If the session has been revoked, log an error and throw an unauthorized error
	if (isSessionRevoked) {
		throw ApiError.unauthorized("Session has been revoked");
	}

	// Info: Generate a new access token for the user with the session ID
	const accessToken = signAccessToken({
		userId: payload.userId,
		sessionId: payload.sessionId,
		type: "access",
	});

	// Info: Generate a new refresh token for the user with the session ID
	const newRefreshToken = signRefreshToken({
		userId: payload.userId,
		sessionId: payload.sessionId,
		type: "refresh",
	});

	// Info: Update the session with the new refresh token and expiration date
	session.tokenHash = newRefreshToken;

	// Info: Update the session expiration date based on the configured refresh token expiration time
	session.expiresAt = new Date(
		Date.now() + ms(appConfig.JWT_REFRESH_EXPIRES_IN as StringValue),
	);

	// Info: Save the updated session record to the database
	await session.save();

	// Info: Return the new access token and refresh token
	return {
		accessToken,
		refreshToken: newRefreshToken,
	};
};
