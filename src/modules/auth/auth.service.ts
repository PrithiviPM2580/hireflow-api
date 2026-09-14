//! ============================================================
//! 🔧 Auth Service — Business logic of authentication
//! ============================================================

import ms, { type StringValue } from "ms";
import { appConfig } from "@/config/app.config";
import { sendEmail } from "@/config/resend.config";
import type { IUser } from "@/database/models/user.model";
import * as verificationRepository from "@/modules/verification/verification.repository";
import { ApiError } from "@/utils/api-error.util";
import { verificationEmailTemplate } from "@/utils/email-template.util";
import { generateMongooseObjectId } from "@/utils/index.util";
import { signEmailVerificationToken } from "@/utils/jwt.util";
import logger from "@/utils/logger.util";
import * as authRepository from "./auth.repository";
import type { RegisterInput } from "./auth.schema";

//> -----------------------------------------------------------------
//> Fn:register() — Desc: Register a new user
//> -----------------------------------------------------------------
export const register = async (
	userData: RegisterInput["body"],
): Promise<IUser> => {
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
	await verificationRepository.create({
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
	return user;
};
