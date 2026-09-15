//! ============================================================
//! 🔧 Auth Service — Business logic of authentication
//! ============================================================

import ms, { type StringValue } from "ms";
import { appConfig } from "@/config/app.config";
import { sendEmail } from "@/config/resend.config";
import * as verificationRepository from "@/modules/verification/verification.repository";
import { ApiError } from "@/utils/api-error.util";
import { verificationEmailTemplate } from "@/utils/email-template.util";
import { generateMongooseObjectId } from "@/utils/index.util";
import {
	signEmailVerificationToken,
	verifyEmailVerificationToken,
} from "@/utils/jwt.util";
import logger from "@/utils/logger.util";
import * as authRepository from "./auth.repository";
import type { RegisterInput, VerifyEmailQuery } from "./auth.schema";

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
//> Fn:verifyEmail() — Desc: Verify the email of a user
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
