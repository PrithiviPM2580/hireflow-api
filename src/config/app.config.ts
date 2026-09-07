//! ============================================================
//! ⚙️ Config — Application configuration
//! ============================================================

import path from "node:path";
import { config as loadEnv } from "dotenv";
import { appConfigSchema } from "@/schema/app.schema";
import logger from "@/utils/logger.util";

// Info: Load environment variables from .env file based on the environment
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

// Info: Load environment variables from the specified .env file
loadEnv({
	path: path.resolve(process.cwd(), envFile),
});

// Info: Validate the loaded environment variables against the schema
const parsedConfig = appConfigSchema.safeParse(process.env);

// Info: If validation fails, log the errors and exit the process
if (!parsedConfig.success) {
	logger.error(
		"Invalid environment variables:",
		parsedConfig.error.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
			code: issue.code,
		})),
		{ label: "AppConfig" },
	);

	process.exit(1);
}

export const appConfig = parsedConfig.data;
