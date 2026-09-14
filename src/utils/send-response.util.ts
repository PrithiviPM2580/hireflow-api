//! ============================================================
//! 🔨 Send Response Utility — Send the json data
//! ============================================================

import type { Response } from "express";
import logger from "./logger.util";

//@ -----------------------------------------------------------------
//@ Interface:SendResponseOptions — Desc: Interface to send response options
//@ -----------------------------------------------------------------
interface SendResponseOptions<T> {
	statusCode?: number;
	message?: string;
	data?: T;
}

//> -----------------------------------------------------------------
//> Fn:sendResponse() — Desc: Sending the response
//> -----------------------------------------------------------------
export const sendResponse = <T>(
	res: Response,
	{ statusCode = 200, message = "Success", data }: SendResponseOptions<T>,
) => {
	logger.info(`Success Response: ${message}`, {
		label: "Success Response",
		data,
	});

	return res.status(statusCode).json({
		success: true,
		message,
		data,
	});
};
