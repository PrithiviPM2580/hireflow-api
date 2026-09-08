//! ============================================================
//! 🛡️ Rate Limiting Middleware —
//! ============================================================

import type { Request } from "express";
import { ipKeyGenerator, type Options, rateLimit } from "express-rate-limit";
import { appConfig } from "@/config/app.config";

//> -----------------------------------------------------------------
//> Fn:keyGenerator() — Desc: Generate a unique key for rate limiting based on user ID or IP address
//> -----------------------------------------------------------------
const keyGenerator = (req: Request) => {
	// Info: If the user is authenticated, use their user ID as the key
	if (req.auth?.userId) {
		return req.auth.userId.toString();
	}

	// Info: If the user is not authenticated, use their IP address as the key
	return ipKeyGenerator(req.ip ?? "");
};

//@ -----------------------------------------------------------------
//@ Obj:commonOptions — Desc: Common options for rate limiting
//@ -----------------------------------------------------------------------
const commonOptions = {
	standardHeaders: "draft-7", // Use standard rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
	legacyHeaders: false, // Disable the legacy rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
	keyGenerator, // Use the custom key generator function to identify users
	message: {
		statusCode: 429,
		status: "fail",
		message: "Too many requests, please try again later.",
	},
} satisfies Partial<Options>;

//> -----------------------------------------------------------------
//> Fn:authRateLimiter() — Desc: Rate limiter for authenticated users
//> --------------------------------------------------------------------
export const authRateLimiter = rateLimit({
	...commonOptions,
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 10, // Limit each user to 10 requests per 15 minutes
	skip: () => appConfig.NODE_ENV === "development", // Skip rate limiting in development environment
});

//> -----------------------------------------------------------------
//> Fn:generalRateLimiter() — Desc: Rate limiter for general requests
//> --------------------------------------------------------------------
export const generalRateLimiter = rateLimit({
	...commonOptions,
	windowMs: 60 * 1000, // 1 minute
	limit: 100, // Limit each user to 100 requests per minute
	skip: () => appConfig.NODE_ENV === "development", // Skip rate limiting in development environment
});

//> -----------------------------------------------------------------
//> Fn:strictRateLimiter() — Desc: Strict rate limiter for sensitive endpoints
//> --------------------------------------------------------------------
export const strictRateLimiter = rateLimit({
	...commonOptions,
	windowMs: 60 * 1000, // 1 minute
	limit: 10, // Limit each user to 10 requests per minute
	skip: () => appConfig.NODE_ENV === "development", // Skip rate limiting in development environment
});
