//! ============================================================
//! 📦 Auth Module — Auth module for openapi
//! ============================================================

import { z } from "zod";
import { openApiRegistry } from "@/openapi/openapi.registry";
import { registerSchema, verifyEmailSchema } from "./auth.schema";

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

const registerResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("User created successfully"),
	data: registeredUserSchema,
});

const verificationSchema = z.object({
	_id: z.string().describe("The verification record's MongoDB identifier"),
	userId: z.string().describe("The verified user's MongoDB identifier"),
	expiresAt: z.iso.datetime(),
	usedAt: z.iso.datetime().nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

const verifyEmailResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("Email verified successfully"),
	data: z.object({
		user: registeredUserSchema,
		verification: verificationSchema,
	}),
});

const errorResponseSchema = z.object({
	message: z.string(),
});

const validationErrorResponseSchema = z.object({
	message: z.literal("Validation failed"),
	errors: z.record(z.string(), z.unknown()),
});

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
