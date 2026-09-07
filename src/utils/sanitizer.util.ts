//! ============================================================
//! 🔨 Sanitizer Utility — Sanitize the
//! ============================================================

import mongoSanitizer from "@exortek/express-mongo-sanitize";
import { appConfig } from "@/config/app.config";

//> -----------------------------------------------------------------
//> Fn:sanitizeMiddleware() — Desc: Description
//> -----------------------------------------------------------------
const sanitize = () =>
	mongoSanitizer({
		recursive: true,
		maxDepth: 20,
		maxDepthBehavior: appConfig.NODE_ENV === "production" ? "remove" : "throw",
		allowPrototypeKeys: appConfig.NODE_ENV !== "production",
		preserveEmails: appConfig.NODE_ENV !== "production",
	});

export default sanitize;
