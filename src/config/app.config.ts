//! ============================================================
//! ⚙️ Config — Application configuration
//! ============================================================

import { appConfigSchema } from "@/schema/app.schema";
import { formatError } from "@/utils/index.util";
import logger from "@/utils/logger.util";
import { loadEnvironment } from "./environment.config.js";

loadEnvironment();

// Info: Validate the loaded environment variables against the schema
const parsedConfig = appConfigSchema.safeParse(process.env);

// Info: If validation fails, log the errors and exit the process
if (!parsedConfig.success) {
	logger.error(
		"Invalid environment variables:",
		formatError(parsedConfig.error.issues),
		{ label: "AppConfig" },
	);

	process.exit(1); // Exit the process with a failure code
}

export const appConfig = parsedConfig.data;
