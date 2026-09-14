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
import authRouter from "@/modules/auth/auth.route";
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
		const responseData = {
			appName: appConfig.APP_NAME,
			status: process.uptime() > 0 ? "Running" : "Stopped",
			timestamp: new Date().toISOString(),
			version: appConfig.APP_VERSION,
			env: appConfig.NODE_ENV,
		};

		// Info: Log the root route access
		logger.info("Root route accessed", responseData, {
			label: "RootRoute",
		});

		// Info: Send success response
		return sendResponse(res, {
			statusCode: status.OK,
			message: "Hireflow API is running successfully",
			data: responseData,
		});
	} catch (error) {
		logger.error("Error in the root route", {
			label: "RootRoute",
			error,
		});

		next(error);
	}
});

//-- ------------------------------------------------------
//--  Health Route
//-- ------------------------------------------------------
// @desc Health Check
// @route GET /health
// @access Public
router
	.route("/health")
	.get((_req: Request, res: Response, next: NextFunction) => {
		try {
			// Info: Database connection state check
			const dbState =
				mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

			const healthData = {
				status: "ok",
				service: appConfig.APP_NAME,
				environment: appConfig.NODE_ENV,
				database: dbState,
				uptime: process.uptime(),
				memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
					2,
				)} MB`,
				timestamp: new Date().toISOString(),
			};

			// Info: Send health response
			return sendResponse(res, {
				statusCode: status.OK,
				message: "Health check successful",
				data: healthData,
			});
		} catch (error) {
			logger.error("Error in health route", {
				label: "Health Route",
				error,
			});

			next(error);
		}
	});

//-- ------------------------------------------------------
//--  Auth Route
//-- ------------------------------------------------------
router.use("/api/v1/auth", authRouter);

export default router;
