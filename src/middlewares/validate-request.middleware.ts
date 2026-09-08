//! ============================================================
//! 🛡️ Validate Request Middleware — Validate the request data
//! ============================================================

import status from "http-status";
import { type Schemas, validate } from "zod-express-validator";
import { formatZodError } from "@/utils/index.util";

//> -----------------------------------------------------------------
//> Fn:validateRequest() — Desc: Validate the request data
//> -----------------------------------------------------------------
export const validateRequest = (schemas: Schemas) => {
	// Info: Use the validate function from zod-express-validator to validate the request
	return validate(schemas, ({ bodyError, queryError, paramsError }, res) => {
		// Error: Check for validation errors in body, query, and params
		const error = bodyError ?? queryError ?? paramsError;

		// Info: If there is a validation error, format and send the error response
		if (error) {
			return formatZodError(error, res);
		}

		// Info: If no validation errors, send a generic validation error response
		return res.status(status.BAD_REQUEST).json({
			message: "Validation Error",
		});
	});
};
