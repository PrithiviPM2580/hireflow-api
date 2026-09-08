//! ============================================================
//! 🔌 OpenAPI Document — Generate OpenAPI documentation
//! ============================================================

import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { openApiRegistry } from "./openapi.registry";
import "@/modules/auth/auth.openapi";

//@ -----------------------------------------------------------------
//@ Obj:openapiDocument — Desc: Generate the OpenAPI document
//@ ---------------------------------------------------------------------
export const openapiDocument = new OpenApiGeneratorV3(
	openApiRegistry.definitions,
).generateDocument({
	openapi: "3.0.0",
	info: {
		title: "Hireflow API",
		version: "1.0.0",
		description: "Job marketplace and hiring platform API documentation",
	},
	servers: [
		{
			url: "http://localhost:3000/api/v1",
		},
	],
});
