//! ============================================================
//! ✅ Auth Validator — Validate the request schema
//! ============================================================

import { validateRequest } from "@/middlewares/validate-request.middleware";
import { loginSchema, registerSchema } from "./auth.schema";

//> -----------------------------------------------------------------
//> Fn:Validator() — Desc: Validate the request schema
//> -----------------------------------------------------------------
export const registerValidator = validateRequest(registerSchema);
export const loginValidator = validateRequest(loginSchema);
