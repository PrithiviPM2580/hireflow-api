//! ============================================================
//! 📐 Token Payload Schema — Data validation schema for token payload
//! ============================================================

import { z } from "zod";

//@ -----------------------------------------------------------------
//@ Obj:accessTokenSchema — Desc: Access token payload
//@ -----------------------------------------------------------------
export const accessTokenSchema = z.object({
	userId: z.string(),
	sessionId: z.string(),
	type: z.literal("access"),
});

//@ -----------------------------------------------------------------
//@ Obj:refreshTokenSchema — Desc: Refresh token payload
//@ -----------------------------------------------------------------
export const refreshTokenSchema = z.object({
	userId: z.string(),
	sessionId: z.string(),
	type: z.literal("refresh"),
});

//@ -----------------------------------------------------------------
//@ Obj:emailVerificationTokenSchema — Desc: Email verification token payload
//@ -----------------------------------------------------------------
export const emailVerificationTokenSchema = z.object({
	userId: z.string(),
	verificationId: z.string(),
	type: z.literal("email_verification"),
});

//@ -----------------------------------------------------------------
//@ Obj:passwordResetTokenSchema — Desc: Password reset token payload
//@ -----------------------------------------------------------------
export const passwordResetTokenSchema = z.object({
	userId: z.string(),
	resetId: z.string(),
	type: z.literal("password_reset"),
});

//@ -----------------------------------------------------------------
//@ Type:InferType — Desc: Infer the given schema type
//@ -----------------------------------------------------------------
export type AccessTokenPayload = z.infer<typeof accessTokenSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenSchema>;
export type EmailVerificationTokenPayload = z.infer<
	typeof emailVerificationTokenSchema
>;
export type PasswordResetTokenPayload = z.infer<
	typeof passwordResetTokenSchema
>;
