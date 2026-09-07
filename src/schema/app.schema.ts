//! ============================================================
//! 📐 Schema — Data validation schema
//! ============================================================

import { z } from "zod";

//@ -----------------------------------------------------------------
//@ Obj:appConfigSchema — Desc: Application configuration schema
//@ ---------------------------------------------------------------------
export const appConfigSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3000),

	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	BASE_PATH: z.string().default("/api/v1"),

	FRONTEND_URL: z.url().default("http://localhost:5173"),
	APP_ORIGIN: z.url().default("http://localhost:3000"),

	CSRF_SECRET: z.string("CSRF secret must be provided"),

	APP_VERSION: z.string("Application version must be provided"),

	LOG_LEVEL: z
		.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
		.default("info"),

	JWT_SECRET: z.string("JWT secret must be provided"),
	JWT_AUDIENCE: z.string().default("user"),
	JWT_ISSUER: z.string().default("advance-mern-auth"),

	JWT_ACCESS_SECRET: z.string("JWT access secret must be provided"),
	JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

	JWT_REFRESH_SECRET: z.string("JWT refresh secret must be provided"),
	JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

	EMAIL_VERIFICATION_EXPIRES_MINUTES: z.coerce
		.number()
		.int()
		.positive()
		.default(15),

	PASSWORD_RESET_EXPIRES_MINUTES: z.coerce
		.number()
		.int()
		.positive()
		.default(15),

	GOOGLE_CLIENT_ID: z.string("Google client ID must be provided"),
	GOOGLE_CLIENT_SECRET: z.string("Google client secret must be provided"),
	GOOGLE_CALLBACK_URL: z.string("Google callback URL must be provided"),

	MONGODB_URI: z.string("MongoDB URI must be provided"),
	DB_NAME: z.string("Database name must be provided"),

	APP_NAME: z.string("Application name must be provided"),
});
