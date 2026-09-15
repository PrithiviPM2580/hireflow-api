//! ============================================================
//! 🛣️ Auth Routes — API route definitions for auth
//! ============================================================

import { Router } from "express";
import * as authController from "./auth.controller";
import { registerValidator, verifyEmailValidator } from "./auth.validator";

//-- ------------------------------------------------------
//--  AuthRouter instance
//-- ------------------------------------------------------
const authRouter: Router = Router();

authRouter.route("/register").post(registerValidator, authController.register);

authRouter
	.route("/verify-email")
	.get(verifyEmailValidator, authController.verifyEmail);

export default authRouter;
