//! ============================================================
//! 🛣️ Routes — API route definitions
//! ============================================================

import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import status from "http-status";
import mongoose from "mongoose";
import { appConfig } from "@/config/app.config";
import logger from "@/utils/logger.util";
import { sendResponse } from "@/utils/send-response.util";

//-- ------------------------------------------------------
//--  Router instance
//-- ------------------------------------------------------
const router: Router = Router();

//-- ------------------------------------------------------
//--  Root Route
//-- ------------------------------------------------------
// @desc Get API status
// @route GET /
// @access Public
router.route("/").get((_req: Request, res: Response, next: NextFunction) => {
	try {
		// Info: Log the root route access with details
		logger.info(
			"Root route accessed",
			{
				appName: appConfig.APP_NAME,
				status: process.uptime() > 0 ? "Running" : "Stopped",
				timestamp: new Date().toISOString(),
				version: appConfig.APP_VERSION,
				env: appConfig.NODE_ENV,
			},
			{ label: "RootRoute" },
		);

		// Info: Send a success response indicating the API is running
		sendResponse(res, status.OK, "Hireflow API is running successfully", {
			appName: appConfig.APP_NAME,
			status: process.uptime() > 0 ? "Running" : "Stopped",
			timestamp: new Date().toISOString(),
			version: appConfig.APP_VERSION,
			env: appConfig.NODE_ENV,
		});
	} catch (error) {
		// Error: Log any errors that occur while accessing the root route
		logger.error("Error in the root route", {
			label: "RootRoute",
			error,
		});

		// Error: Pass the error to the next middleware for handling
		next(error);
	}
});

//-- ------------------------------------------------------
//--  Health Route
//-- ------------------------------------------------------
// @desc Health Check
// @route GET health
// @access Public
router
	.route("/health")
	.get((_req: Request, res: Response, next: NextFunction) => {
		try {
			// Info: Database connection state check
			const dbState =
				mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

			// Info: Send a standardized response indicating the health status of the application, including database connection state, uptime, memory usage, and timestamp
			sendResponse(res, 200, "Health check successful", {
				status: "ok",
				service: appConfig.APP_NAME,
				environment: appConfig.NODE_ENV,
				database: dbState,
				uptime: process.uptime(),
				memoryusage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			// ERROR: Error handling for health route, logging the error details for debugging and monitoring purposes
			logger.error("Error in health route", {
				label: "Health Route",
				error,
			});

			// Error: Pass the error to the next middleware for handling
			next(error);
		}
	});

export default router;
