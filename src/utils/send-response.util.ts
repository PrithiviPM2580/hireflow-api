//! ============================================================
//! 🔨 Send Response Utility — Send the json data
//! ============================================================

import type { Response } from "express";
import logger from "./logger.util";

//> -----------------------------------------------------------------
//> Fn:sendResponse() — Desc: Sending the response
//> -----------------------------------------------------------------
export const sendResponse = <T>(
	res: Response,
	statusCode: number = 200,
	message: string = "Success",
	data?: T,
) => {
	// Info: Log the success response with details
	logger.info(`Success Response: ${message}`, {
		label: "Success Response",
		data: data,
	});

	// Info: Return a JSON response with the provided status code, message, and data
	return res.status(statusCode).json({
		success: true,
		message,
		data,
	});
};
