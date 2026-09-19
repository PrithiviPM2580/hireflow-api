//! ============================================================
//! 🛣️ Auth Routes — API route definitions for auth
//! ============================================================

import { Router } from "express";
import * as authController from "./auth.controller";
import {
	loginValidator,
	registerValidator,
	verifyEmailValidator,
} from "./auth.validator";

//-- ------------------------------------------------------
//--  AuthRouter instance
//-- ------------------------------------------------------
const authRouter: Router = Router();

//-- ------------------------------------------------------
//--  Register Route
//-- ------------------------------------------------------
// @desc Register a new user
// @route POST /api/v1/auth/register
// @access Public
authRouter.route("/register").post(registerValidator, authController.register);

//-- ------------------------------------------------------
//--  Verify Email Route
//-- ------------------------------------------------------
// @desc Verify a user's email
// @route GET /api/v1/auth/verify-email
// @access Public
authRouter
	.route("/verify-email")
	.get(verifyEmailValidator, authController.verifyEmail);

//-- ------------------------------------------------------
//--  Login Route
//-- ------------------------------------------------------
// @desc Log in a user
// @route POST /api/v1/auth/login
// @access Public
authRouter.route("/login").post(loginValidator, authController.login);

//-- ------------------------------------------------------
//--  Refresh Route
//-- ------------------------------------------------------
// @desc Refresh a user's session
// @route POST /api/v1/auth/refresh
// @access Public
authRouter.route("/refresh").post(authController.refresh);

export default authRouter;
