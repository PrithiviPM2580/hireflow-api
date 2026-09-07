//! ============================================================
//! 🔖 Constants — Application constants
//! ============================================================

// Info: Error codes for the application
export const ERROR_CODE = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	ACCESS_UNAUTHORIZED: "ACCESS_UNAUTHORIZED",
	ACCESS_FORBIDDEN: "ACCESS_FORBIDDEN",
	RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
	RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
	TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
	INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
	BAD_REQUEST: "BAD_REQUEST",
} as const;

// Info: Type definition for error codes
export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
