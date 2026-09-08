//! ============================================================
//! 🛡️ Multer Middleware — Handle multipart/form-data
//! ============================================================

import type { RequestHandler } from "express";
import multer from "multer";
import { ApiError } from "@/utils/api-error.util";
import logger from "@/utils/logger.util";

// Info: Configure Multer storage to use memory storage
const storage = multer.memoryStorage();

//> -----------------------------------------------------------------
//> Fn:fileFilter() — Desc: Filter files based on their MIME type
//> -----------------------------------------------------------------
const fileFilter: multer.Options["fileFilter"] = (
	_req: Express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	// Info: Define allowed MIME types for uploaded files
	const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

	// Info: Check if the uploaded file's MIME type is in the allowed list
	if (!allowedMimeTypes.includes(file.mimetype)) {
		// Warn: Log a warning if the uploaded file type is not allowed
		logger.warn("Invalid file type uploaded", {
			label: "Multer Middleware",
			fileType: file.mimetype,
		});

		// Error: Return a bad request error if the file type is invalid
		return cb(
			ApiError.badRequest(
				`Invalid file type uploaded: ${file.mimetype}. Allowed types are: ${allowedMimeTypes.join(", ")}`,
			),
		);
	}

	// Info: If the file type is valid, allow the file to be uploaded
	return cb(null, true);
};

//> -----------------------------------------------------------------
//> Fn:upload() — Desc: Initialize the Multer upload instance
//> -----------------------------------------------------------------
const upload = multer({
	storage, // Use memory storage for uploaded files
	fileFilter, // Use the custom file filter to validate file types
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
		files: 10, // Limit the number of files to 10
	},
});

//> -----------------------------------------------------------------
//> Fn:uploadSingleFile() — Desc: Upload a single file
//> -------------------------------------------------------------------
export const uploadSingleFile = (fieldName: string): RequestHandler =>
	upload.single(fieldName);

//> -----------------------------------------------------------------
//> Fn:uploadMultipleFiles() — Desc: Upload multiple files
//> -------------------------------------------------------------------
export const uploadMultipleFiles = (
	fieldName: string,
	maxCount: number,
): RequestHandler => upload.array(fieldName, maxCount);

//> -----------------------------------------------------------------
//> Fn:uploadFields() — Desc: Upload files in specific fields
//> -------------------------------------------------------------------
export const uploadFields = (
	fields: { name: string; maxCount?: number }[],
): RequestHandler => upload.fields(fields);
