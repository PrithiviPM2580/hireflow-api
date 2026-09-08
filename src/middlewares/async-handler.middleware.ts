//! ============================================================
//! 🛡️ Async Handler Middleware —
//! ============================================================

import type { RequestHandler } from "express";

//> -----------------------------------------------------------------
//> Fn:asyncHandler() — Desc: Middleware to handle async errors in Express
//> -----------------------------------------------------------------
export const asyncHandler = (handler: RequestHandler): RequestHandler => {
	return (req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};
};
