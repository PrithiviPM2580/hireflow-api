//! ============================================================
//! 🔨 JWT Utility — Reusable utility functions for
//! ============================================================

import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import type { ZodType } from "zod";
import { appConfig } from "@/config/app.config";
import {
	type AccessTokenPayload,
	accessTokenSchema,
	type EmailVerificationTokenPayload,
	emailVerificationTokenSchema,
	type PasswordResetTokenPayload,
	passwordResetTokenSchema,
	type RefreshTokenPayload,
	refreshTokenSchema,
} from "@/schema/token-payload.schema";
import { ApiError } from "./api-error.util";
import logger from "./logger.util";

//> -----------------------------------------------------------------
//> Fn:signToken() — Desc: Signs a token with the given payload and secret
//> -----------------------------------------------------------------
const signToken = <T extends JwtPayload>(
	payload: T,
	secret: string,
	options?: SignOptions,
): string => {
	// Info: Sign the token with the given payload and secret
	return jwt.sign(payload, secret, {
		audience: appConfig.JWT_AUDIENCE,
		issuer: appConfig.JWT_ISSUER,
		...options,
	});
};

//> -----------------------------------------------------------------
//> Fn:verifyToken() — Desc: Verifies a token with the given secret and schema
//> -----------------------------------------------------------------
const verifyToken = <T extends JwtPayload>(
	token: string,
	secret: string,
	schema: ZodType<T>,
): T => {
	try {
		// Info: Verify the token with the given secret and schema
		const decoded = jwt.verify(token, secret, {
			audience: appConfig.JWT_AUDIENCE,
			issuer: appConfig.JWT_ISSUER,
		});

		// Info: Validate the decoded token against the provided schema
		return schema.parse(decoded);
	} catch (error) {
		// Error: Handle token verification errors and throw appropriate ApiError
		if (error instanceof jwt.TokenExpiredError) {
			logger.error("Token has expired", { label: "JWTUtility", error });
			throw ApiError.unauthorized("Token has expired");
		}

		// Error: Handle invalid token errors and throw appropriate ApiError
		if (error instanceof jwt.JsonWebTokenError) {
			logger.error("Invalid token", { label: "JWTUtility", error });
			throw ApiError.unauthorized("Invalid token");
		}

		// Error: Handle any other errors and throw a generic ApiError
		logger.error("Token verification failed", { label: "JWTUtility", error });
		throw error;
	}
};

//> -----------------------------------------------------------------
//> Fn:signAccessToken() — Desc: Signs an access token with the given payload and secret
//> -----------------------------------------------------------------
export const signAccessToken = (payload: AccessTokenPayload): string => {
	// Info: Sign the access token with the given payload and secret
	return signToken(payload, appConfig.JWT_ACCESS_SECRET, {
		expiresIn: appConfig.JWT_ACCESS_EXPIRES_IN as StringValue,
	});
};

//> -----------------------------------------------------------------
//> Fn:verifyAccessToken() — Desc: Verifies an access token with the given secret and schema
//> -----------------------------------------------------------------
export const verifyAccessToken = (token: string): AccessTokenPayload => {
	// Info: Verify the access token with the given secret and schema
	return verifyToken(token, appConfig.JWT_ACCESS_SECRET, accessTokenSchema);
};

//> -----------------------------------------------------------------
//> Fn:signRefreshToken() — Desc: Signs a refresh token with the given payload and secret
//> -----------------------------------------------------------------
export const signRefreshToken = (payload: RefreshTokenPayload): string => {
	// Info: Sign the refresh token with the given payload and secret
	return signToken(payload, appConfig.JWT_REFRESH_SECRET, {
		expiresIn: appConfig.JWT_REFRESH_EXPIRES_IN as StringValue,
	});
};
//> -----------------------------------------------------------------
//> Fn:verifyRefreshToken() — Desc: Verifies a refresh token with the given secret and schema
//> -----------------------------------------------------------------
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
	// Info: Verify the refresh token with the given secret and schema
	return verifyToken(token, appConfig.JWT_REFRESH_SECRET, refreshTokenSchema);
};

//> -----------------------------------------------------------------
//> Fn:signEmailVerificationToken() — Desc: Signs an email verification token with the given payload and secret
//> -----------------------------------------------------------------
export const signEmailVerificationToken = (
	payload: EmailVerificationTokenPayload,
): string => {
	// Info: Sign the email verification token with the given payload and secret
	return signToken(payload, appConfig.JWT_EMAIL_VERIFICATION_SECRET, {
		expiresIn: appConfig.JWT_EMAIL_VERIFICATION_EXPIRES_IN as StringValue,
	});
};

//> -----------------------------------------------------------------
//> Fn:verifyEmailVerificationToken() — Desc: Verifies an email verification token with the given secret and schema
//> -----------------------------------------------------------------
export const verifyEmailVerificationToken = (
	token: string,
): EmailVerificationTokenPayload => {
	// Info: Verify the email verification token with the given secret and schema
	return verifyToken(
		token,
		appConfig.JWT_EMAIL_VERIFICATION_SECRET,
		emailVerificationTokenSchema,
	);
};

//> -----------------------------------------------------------------
//> Fn:signPasswordResetToken() — Desc: Signs a password reset token with the given payload and secret
//> -----------------------------------------------------------------
export const signPasswordResetToken = (
	payload: PasswordResetTokenPayload,
): string => {
	// Info: Sign the password reset token with the given payload and secret
	return signToken(payload, appConfig.JWT_PASSWORD_RESET_SECRET, {
		expiresIn: appConfig.JWT_PASSWORD_RESET_EXPIRES_IN as StringValue,
	});
};

//> -----------------------------------------------------------------
//> Fn:verifyPasswordResetToken() — Desc: Verifies a password reset token with the given secret and schema
//> -----------------------------------------------------------------
export const verifyPasswordResetToken = (
	token: string,
): PasswordResetTokenPayload => {
	// Info: Verify the password reset token with the given secret and schema
	return verifyToken(
		token,
		appConfig.JWT_PASSWORD_RESET_SECRET,
		passwordResetTokenSchema,
	);
};
