//! ============================================================
//! 🛡️ Async Handler Middleware
//! ============================================================

import type { NextFunction } from "express";

//> -----------------------------------------------------------------
//> Fn:asyncHandler() — Desc: Middleware to handle async errors
//> -----------------------------------------------------------------
export const asyncHandler = <
	TReq,
	TRes,
	TNext extends NextFunction = NextFunction,
>(
	handler: (req: TReq, res: TRes, next: TNext) => void | Promise<void>,
) => {
	return (req: TReq, res: TRes, next: TNext) => {
		Promise.resolve()
			.then(() => handler(req, res, next))
			.catch(next);
	};
};
