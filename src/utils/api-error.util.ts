//! ============================================================
//! 🔨 API Error Utility — Handles the API error
//! ============================================================

import { status } from "http-status";
import { ERROR_CODE, type ErrorCode } from "@/constants/error-code.constant";

//@ -----------------------------------------------------------------
//@ Class:ApiError — Desc: Custom error class for API errors
//@ -----------------------------------------------------------------

export class ApiError extends Error {
	// Info: Properties of the ApiError class
	public readonly statusCode: number;
	public readonly errorCode: ErrorCode;
	public readonly isOperational: boolean;

	// Info: Constructor for the ApiError class
	constructor(
		message: string,
		statusCode: number = status.INTERNAL_SERVER_ERROR,
		errorCode: ErrorCode = ERROR_CODE.INTERNAL_SERVER_ERROR,
		isOperational = true,
	) {
		// Info: Initialize the ApiError instance

		super(message);

		this.name = "ApiError";
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, ApiError);
	}

	// Error: Static methods for creating specific types of API errors
	static badRequest(message = "Bad request", errorCode?: ErrorCode) {
		return new ApiError(message, status.BAD_REQUEST, errorCode);
	}

	// Error: Static method for creating an unauthorized error
	static unauthorized(
		message = "Unauthorized",
		errorCode = ERROR_CODE.ACCESS_UNAUTHORIZED,
	) {
		return new ApiError(message, status.UNAUTHORIZED, errorCode);
	}

	// Error: Static method for creating a forbidden error
	static notFound(
		message = "Resource not found",
		errorCode = ERROR_CODE.RESOURCE_NOT_FOUND,
	) {
		return new ApiError(message, status.NOT_FOUND, errorCode);
	}

	// Error: Static method for creating a forbidden error
	static conflict(message = "Conflict", errorCode?: ErrorCode) {
		return new ApiError(message, status.CONFLICT, errorCode);
	}

	// Error: Static method for creating an internal server error
	static internalServer(
		message = "Internal server error",
		errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR,
	) {
		return new ApiError(message, status.INTERNAL_SERVER_ERROR, errorCode);
	}

	// Error: Static method for creating a too many requests error
	static tooManyRequests(
		message = "Too many requests",
		errorCode = ERROR_CODE.TOO_MANY_REQUESTS,
	) {
		return new ApiError(message, status.TOO_MANY_REQUESTS, errorCode);
	}
}
