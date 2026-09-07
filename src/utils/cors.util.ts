//! ============================================================
//! 🔨 Cors Utility — Cors
//! ============================================================

import cors, { type CorsOptions } from "cors";
import { appConfig } from "@/config/app.config";

//@ -----------------------------------------------------------------
//@ Obj:corsOptions — Desc: Options for cors
//@ -----------------------------------------------------------------
const corsOptions: CorsOptions = {
	origin: appConfig.APP_ORIGIN,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

export default cors(corsOptions);
