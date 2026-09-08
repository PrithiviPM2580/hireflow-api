//! ============================================================
//! 🛡️ CSRF Middleware —
//! ============================================================

import { doubleCsrf } from "csrf-csrf";
import type { Request } from "express";
import { appConfig } from "@/config/app.config";

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
	getSecret: () => appConfig.CSRF_SECRET,
	getSessionIdentifier: (req: Request) =>
		req.auth?.userId?.toString() ?? "anonymous",
	cookieName: "csrf-token",
	cookieOptions: {
		httpOnly: false,
		sameSite: appConfig.NODE_ENV === "production" ? "strict" : "lax",
		secure: appConfig.NODE_ENV === "production",
	},
	getCsrfTokenFromRequest: (req: Request) => req.get("X-CSRF-Token") ?? "",
});

export { doubleCsrfProtection, generateCsrfToken };
