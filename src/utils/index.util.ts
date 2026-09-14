//! ============================================================
//! 🔨 Utility — Reusable utility functions
//! ============================================================

import type { Response } from "express";
import status from "http-status";
import mongoose from "mongoose";
import type { z } from "zod";

//> -----------------------------------------------------------------
//> Fn:formatZodError() — Desc: Formats a Zod error into a JSON response
//> ---------------------------------------------------------------------
export const formatZodError = (error: z.ZodError, res: Response): Response => {
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

//> -----------------------------------------------------------------
//> Fn:formatError() — Desc: Formats a Zod issue into a JSON object
//> -----------------------------------------------------------------
export const formatError = (issues: z.core.$ZodIssue[]) =>
	issues.map((issue) => ({
		path: issue.path.join("."),
		message: issue.message,
		code: issue.code,
	}));

//> -----------------------------------------------------------------
//> Fn:generateMongooseObjectId() — Desc: Generates a new Mongoose ObjectID
//> -----------------------------------------------------------------
export const generateMongooseObjectId = () => {
	// Info: Generate a new Mongoose ObjectID using the Mongoose library
	return new mongoose.Types.ObjectId();
};
