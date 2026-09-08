//! ============================================================
//! Environment — Load raw environment variables
//! ============================================================

import path from "node:path";
import { config as loadEnv } from "dotenv";

export const loadEnvironment = () => {
	const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

	loadEnv({
		path: path.resolve(process.cwd(), envFile),
	});
};
