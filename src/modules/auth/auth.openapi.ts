//! ============================================================
//! 📦 Auth Module — Auth module for openapi
//! ============================================================

import { openApiRegistry } from "@/openapi/openapi.registry";
import { registerSchema } from "./auth.schema";

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
		},
		400: {
			description: "Invalid Request",
		},
		409: {
			description: "Email already exists",
		},
	},
});
