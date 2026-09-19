//! ============================================================
//! 📦 Auth Module — Auth module for openapi
//! ============================================================

import { z } from "zod";
import { openApiRegistry } from "@/openapi/openapi.registry";
import { loginSchema, registerSchema, verifyEmailSchema } from "./auth.schema";

//@ -----------------------------------------------------------------
//@ Obj:registeredUserSchema — Desc: Schema for a registered user
//@ -----------------------------------------------------------------
const registeredUserSchema = z.object({
	_id: z.string().describe("The user's MongoDB identifier"),
	name: z.string(),
	email: z.email(),
	role: z.enum(["CANDIDATE", "RECRUITER", "ADMIN"]),
	isVerified: z.boolean(),
	isActive: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

//@ -----------------------------------------------------------------
//@ Obj:registerResponseSchema — Desc: Schema for the register response
//@ -----------------------------------------------------------------
const registerResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("User created successfully"),
	data: registeredUserSchema,
});

//@ -----------------------------------------------------------------
//@ Obj:verifyEmailResponseSchema — Desc: Schema for the verify email response
//@ -----------------------------------------------------------------
const verificationSchema = z.object({
	_id: z.string().describe("The verification record's MongoDB identifier"),
	userId: z.string().describe("The verified user's MongoDB identifier"),
	expiresAt: z.iso.datetime(),
	usedAt: z.iso.datetime().nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

//@ -----------------------------------------------------------------
//@ Obj:verifyEmailResponseSchema — Desc: Schema for the verify email response
//@ -----------------------------------------------------------------
const verifyEmailResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("Email verified successfully"),
	data: z.object({
		user: registeredUserSchema,
		verification: verificationSchema,
	}),
});

//@ -----------------------------------------------------------------
//@ Obj:sessionSchema — Desc: Schema for the session
//@ -----------------------------------------------------------------
const sessionSchema = z.object({
	_id: z.string().describe("The session's MongoDB identifier"),
	userId: z.string().describe("The user's MongoDB identifier"),
	expiresAt: z.iso.datetime(),
	revokedAt: z.iso.datetime().nullable(),
	createdAt: z.iso.datetime(),
});

//@ -----------------------------------------------------------------
//@ Obj:loginResponseSchema — Desc: Schema for the login response
//@ -----------------------------------------------------------------
const loginResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("Login successful"),
	data: z.object({
		user: registeredUserSchema,
		session: sessionSchema,
		accessToken: z.string(),
		refreshToken: z.string(),
	}),
});

//@ -----------------------------------------------------------------
//@ Obj:refreshResponseSchema — Desc: Schema for the refresh response
//@ -----------------------------------------------------------------
const refreshResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("Token refreshed successfully"),
	data: z.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	}),
});

//@ -----------------------------------------------------------------
//@ Obj:errorResponseSchema — Desc: Schema for error responses
//@ -----------------------------------------------------------------
const errorResponseSchema = z.object({
	message: z.string(),
});

//@ -----------------------------------------------------------------
//@ Obj:validationErrorResponseSchema — Desc: Schema for validation error responses
//@ -----------------------------------------------------------------
const validationErrorResponseSchema = z.object({
	message: z.literal("Validation failed"),
	errors: z.record(z.string(), z.unknown()),
});

//-- ------------------------------------------------------
//--  Register : OpenAPI Paths for Authentication
//-- ------------------------------------------------------
openApiRegistry.registerPath({
	method: "post",
	path: "/auth/register",
	tags: ["Authentication"],
	summary: "Register a new user",
	description: "Creates a new Hireflow user account with the provided details.",
	request: {
		body: {
			required: true,
			content: {
				"application/json": {
					schema: registerSchema.body,
				},
			},
		},
	},
	responses: {
		201: {
			description: "User registered successfully",
			content: {
				"application/json": {
					schema: registerResponseSchema,
				},
			},
		},
		400: {
			description: "Invalid request or email already exists",
			content: {
				"application/json": {
					schema: z.union([errorResponseSchema, validationErrorResponseSchema]),
				},
			},
		},
		500: {
			description: "Unexpected server error",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
	},
});

//-- ------------------------------------------------------
//--  Verify Email : OpenAPI Paths for Authentication
//-- ------------------------------------------------------
openApiRegistry.registerPath({
	method: "get",
	path: "/auth/verify-email",
	tags: ["Authentication"],
	summary: "Verify a user's email",
	description: "Verifies a user's email address using the token sent by email.",
	request: {
		query: verifyEmailSchema.query,
	},
	responses: {
		200: {
			description: "Email verified successfully",
			content: {
				"application/json": {
					schema: verifyEmailResponseSchema,
				},
			},
		},
		400: {
			description: "Invalid, expired, or already used verification token",
			content: {
				"application/json": {
					schema: z.union([errorResponseSchema, validationErrorResponseSchema]),
				},
			},
		},
		401: {
			description: "Unauthorized token",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
		404: {
			description: "User not found for verification",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
	},
});

//-- ------------------------------------------------------
//--  Login : OpenAPI Paths for Authentication
//-- ------------------------------------------------------
openApiRegistry.registerPath({
	method: "post",
	path: "/auth/login",
	tags: ["Authentication"],
	summary: "Log in a user",
	description: "Authenticates a user and returns access and refresh tokens.",
	request: {
		body: {
			required: true,
			content: {
				"application/json": {
					schema: loginSchema.body,
				},
			},
		},
	},
	responses: {
		200: {
			description: "User logged in successfully",
			content: {
				"application/json": {
					schema: loginResponseSchema,
				},
			},
		},
		400: {
			description: "Invalid login request",
			content: {
				"application/json": {
					schema: validationErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Email is not verified or password is invalid",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
		404: {
			description: "User not found",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
		500: {
			description: "Unexpected server error",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
	},
});

//-- ------------------------------------------------------
//--  Refresh Token : OpenAPI Paths for Authentication
//-- ------------------------------------------------------
openApiRegistry.registerPath({
	method: "post",
	path: "/auth/refresh",
	tags: ["Authentication"],
	summary: "Refresh authentication tokens",
	description:
		"Validates the refresh token cookie and returns rotated access and refresh tokens.",
	request: {
		cookies: z.object({
			refresh_token: z.string().min(1).describe("The refresh token cookie"),
		}),
	},
	responses: {
		200: {
			description: "Authentication tokens refreshed successfully",
			content: {
				"application/json": {
					schema: refreshResponseSchema,
				},
			},
		},
		401: {
			description: "Refresh token is missing, invalid, expired, or revoked",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
		500: {
			description: "Unexpected server error",
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
		},
	},
});
