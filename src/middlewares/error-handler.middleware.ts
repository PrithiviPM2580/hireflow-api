//! ============================================================
//! 🛡️ Error Handler Middleware — Global error handler
//! ============================================================

import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import status from "http-status";
import { ZodError } from "zod";
import { appConfig } from "@/config/app.config";
import { ApiError } from "@/utils/api-error.util";
import { formatZodError } from "@/utils/index.util";
import logger from "@/utils/logger.util";

// Info: Check development mode for detailed error responses
const isDevelopment = appConfig.NODE_ENV === "development";

//@ -----------------------------------------------------------------
//@ Func:getErrorMessage — Desc: Safely extract error message
//@ -----------------------------------------------------------------
const getErrorMessage = (err: unknown): string => {
	if (err instanceof Error) {
		return err.message;
	}

	return String(err);
};

//@ -----------------------------------------------------------------
//@ Func:getErrorStack — Desc: Safely extract error stack
//@ -----------------------------------------------------------------
const getErrorStack = (err: unknown): string | undefined => {
	if (err instanceof Error) {
		return err.stack;
	}

	return undefined;
};

//@ -----------------------------------------------------------------
//@ Func:getDevelopmentDetails — Desc: Return debug information
//@ -----------------------------------------------------------------
const getDevelopmentDetails = (err: unknown) => {
	if (!isDevelopment) {
		return {};
	}

	return {
		error: getErrorMessage(err),
		stack: getErrorStack(err),
	};
};

//@ -----------------------------------------------------------------
//@ Middleware:errorHandler — Desc: Global Express error handler
//@ -----------------------------------------------------------------
export const errorHandler: ErrorRequestHandler = (
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	//-- ------------------------------------------------------
	//--  Invalid JSON / Request Payload
	//-- ------------------------------------------------------

	if (err instanceof SyntaxError && "body" in err) {
		// Info: Log the invalid request payload error with details
		logger.warn(
			"Invalid request payload",
			{
				method: req.method,
				path: req.path,
				message: getErrorMessage(err),
			},
			{ label: "ErrorHandler" },
		);

		// Info: Return a JSON response indicating the invalid request payload
		return res.status(status.BAD_REQUEST).json({
			message: "Invalid request payload",
			...getDevelopmentDetails(err),
		});
	}

	//-- ------------------------------------------------------
	//--  Zod Validation Error
	//-- ------------------------------------------------------

	if (err instanceof ZodError) {
		// Info: Log the Zod validation error with details
		logger.warn(
			"Validation error",
			{
				method: req.method,
				path: req.path,
				issues: err.issues,
			},
			{ label: "ErrorHandler" },
		);

		// Info: Format and return the Zod validation error as a JSON response
		return formatZodError(err, res);
	}

	//-- ------------------------------------------------------
	//--   Application / API Error
	//-- ------------------------------------------------------

	if (err instanceof ApiError) {
		// Info: Log the application error with details
		logger.error(
			"Application error",
			{
				method: req.method,
				path: req.path,
				statusCode: err.statusCode,
				errorCode: err.errorCode,
				message: err.message,
				stack: err.stack,
			},
			{ label: "ErrorHandler" },
		);

		// Info: Return a JSON response with the application error details
		return res.status(err.statusCode).json({
			message: err.message,
			errorCode: err.errorCode,
			...(isDevelopment && {
				stack: err.stack,
			}),
		});
	}

	//-- ------------------------------------------------------
	//--  Unexpected / Unknown Error
	//-- ------------------------------------------------------

	// Info: Log the unexpected error with details
	logger.error(
		"Unexpected server error",
		{
			method: req.method,
			path: req.path,
			message: getErrorMessage(err),
			stack: getErrorStack(err),
		},
		{ label: "ErrorHandler" },
	);

	// Info: Return a JSON response indicating an unexpected server error
	return res.status(status.INTERNAL_SERVER_ERROR).json({
		message: isDevelopment
			? getErrorMessage(err)
			: "An unexpected error occurred. Please try again later.",

		...(isDevelopment && {
			stack: getErrorStack(err),
		}),
	});
};

export default errorHandler;
