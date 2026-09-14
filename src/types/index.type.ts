//! ============================================================
//! 📝 Types — Type definitions
//! ============================================================

import type { TypedRequestHandler } from "zod-express-validator";
// Info: Generic type for controller
export type Controller<T> = TypedRequestHandler<T>;

export interface AuthContext {
	userId: string;
	sessionId?: string;
}

export type TokenType =
	| "access"
	| "refresh"
	| "email_verification"
	| "password_reset";

export interface AccessTokenPayload {
	userId: string;
	sessionId?: string;
	type: "access";
}

export interface RefreshTokenPayload {
	userId: string;
	sessionId: string;
	type: "refresh";
}

export interface EmailVerificationTokenPayload {
	userId: string;
	verificationId: string;
	type: "email_verification";
}

export interface PasswordResetTokenPayload {
	userId: string;
	resetId: string;
	type: "password_reset";
}
