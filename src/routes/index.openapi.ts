//! ============================================================
//! 📦 Base Routes — OpenAPI definitions for base routes
//! ============================================================

import { z } from "zod";
import { openApiRegistry } from "@/openapi/openapi.registry";

const rootResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("Hireflow API is running successfully"),
	data: z.object({
		appName: z.string(),
		status: z.enum(["Running", "Stopped"]),
		timestamp: z.iso.datetime(),
		version: z.string(),
		env: z.string(),
	}),
});

const healthResponseSchema = z.object({
	success: z.literal(true),
	message: z.literal("Health check successful"),
	data: z.object({
		status: z.literal("ok"),
		service: z.string(),
		environment: z.string(),
		database: z.enum(["Connected", "Disconnected"]),
		uptime: z.number(),
		memoryUsage: z.string(),
		timestamp: z.iso.datetime(),
	}),
});

const baseServer = [{ url: "http://localhost:3000" }];

openApiRegistry.registerPath({
	method: "get",
	path: "/",
	tags: ["System"],
	summary: "Get API status",
	description:
		"Returns the current application status and runtime information.",
	servers: baseServer,
	responses: {
		200: {
			description: "API status returned successfully",
			content: {
				"application/json": {
					schema: rootResponseSchema,
				},
			},
		},
	},
});

openApiRegistry.registerPath({
	method: "get",
	path: "/health",
	tags: ["System"],
	summary: "Check API health",
	description: "Returns application, database, uptime, and memory information.",
	servers: baseServer,
	responses: {
		200: {
			description: "Health check returned successfully",
			content: {
				"application/json": {
					schema: healthResponseSchema,
				},
			},
		},
	},
});
