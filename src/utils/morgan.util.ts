//! ============================================================
//! 🔨 Morgan Utility — HTTP request logger
//! ============================================================

import type { Response } from "express";
import morgan from "morgan";
import { appConfig } from "@/config/app.config";
import logger from "./logger.util";

// Info: Format for morgan logging based on the environment
const format = appConfig.NODE_ENV === "development" ? "dev" : "combined";

//> -----------------------------------------------------------------
//> Fn:successLogger() — Desc: Log success headers
//> -----------------------------------------------------------------
const successLoggerMiddleware = morgan(format, {
	skip: (_, res: Response) =>
		appConfig.NODE_ENV === "test" || res.statusCode >= 400,
	stream: {
		write: (message: string) => {
			logger.info(message.trim(), { label: "HTTP" });
		},
	},
});

//> -----------------------------------------------------------------
//> Fn:errorHeader() — Desc: Log error headers
//> -----------------------------------------------------------------

const errorLoggerMiddleware = morgan(format, {
	skip: (_, res: Response) =>
		appConfig.NODE_ENV === "test" || res.statusCode < 400,
	stream: {
		write: (message: string) => {
			logger.error(message.trim(), { label: "HTTP" });
		},
	},
});

export default {
	successLoggerMiddleware,
	errorLoggerMiddleware,
};
