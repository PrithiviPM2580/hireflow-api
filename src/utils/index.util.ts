//! ============================================================
//! 🔨 Utility — Reusable utility functions
//! ============================================================

import type { Response } from "express";
import status from "http-status";
import type { ZodError } from "zod";

//> -----------------------------------------------------------------
//> Fn:formatZodError() — Desc: Formats a Zod error into a JSON response
//> ---------------------------------------------------------------------

export const formatZodError = (error: ZodError, res: Response): Response => {
	// ERROR: Issues from Zod validation error
	const issues = error.issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
		code: issue.code,
	}));

	// Info:Return a JSON response with the formatted Zod error
	return res.status(status.BAD_REQUEST).json({
		message: "Validation error",
		errors: issues,
	});
};
