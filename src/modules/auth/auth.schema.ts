//! ============================================================
//! 📐 Auth Schema — Schema for the auth
//! ============================================================

import { z } from "zod";
import type { InferSchemas } from "zod-express-validator";

//@ -----------------------------------------------------------------
//@ Obj:registerSchema — Desc: Register the user
//@ -----------------------------------------------------------------
export const registerSchema = {
	body: z.object({
		name: z.string().min(1, "Name is required"),
		email: z.email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters long"),
	}),
};

//@ -----------------------------------------------------------------
//@ Obj:loginSchema — Desc: Login the user
//@ -----------------------------------------------------------------
export const loginSchema = {
	body: z.object({
		email: z.email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters long"),
	}),
};

//@ -----------------------------------------------------------------
//@ Type:InferType  — Desc: Infer the given schema type
//@ -----------------------------------------------------------------
export type RegisterInput = InferSchemas<typeof registerSchema>;
export type LoginInput = InferSchemas<typeof loginSchema>;
