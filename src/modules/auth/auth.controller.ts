//! ============================================================
//! 🎮 Auth Controller — HTTP request handlers for authentication
//! ============================================================

import { asyncHandler } from "@/middlewares/async-handler.middleware";
import type { Controller } from "@/types/index.type";
import { ApiError } from "@/utils/api-error.util";
import { setAuthenticationCookies } from "@/utils/cookie.util";
import { sendResponse } from "@/utils/send-response.util";
import type {
	loginSchema,
	registerSchema,
	verifyEmailSchema,
} from "./auth.schema";
import * as authService from "./auth.service";

//> -----------------------------------------------------------------
//> Fn:register() — Desc: Register a new user
//> -----------------------------------------------------------------
export const register: Controller<typeof registerSchema> = asyncHandler(
	async (req, res) => {
		// Info: Call the authService.register function to register a new user
		const { user, verification } = await authService.register(req.body);

		// Info: Send a success response with the newly created user data
		sendResponse(res, {
			statusCode: 201,
			message: "User created successfully",
			data: {
				user,
				verification,
			},
		});
	},
);

//> -----------------------------------------------------------------
//> Fn:verifyEmail() — Desc: Verify the email of a user
//> -----------------------------------------------------------------
export const verifyEmail: Controller<typeof verifyEmailSchema> = asyncHandler(
	async (req, res) => {
		// Info: Call the authService.verifyEmail function to verify the user's email
		const { user, verification } = await authService.verifyEmail(req.query);

		// Info: Send a success response indicating successful email verification
		sendResponse(res, {
			statusCode: 200,
			message: "Email verified successfully",
			data: {
				user,
				verification,
			},
		});
	},
);

//> -----------------------------------------------------------------
//> Fn:login() — Desc: Login a user
//> -----------------------------------------------------------------
export const login: Controller<typeof loginSchema> = asyncHandler(
	async (req, res) => {
		// Info: Call the authService.login function to authenticate the user and generate tokens
		const { user, session, accessToken, refreshToken } =
			await authService.login(req.body);

		setAuthenticationCookies({
			res,
			accessToken,
			refreshToken,
		});

		// Info: Send a success response with the user data and tokens
		sendResponse(res, {
			statusCode: 200,
			message: "Login successful",
			data: {
				user,
				session,
				accessToken,
				refreshToken,
			},
		});
	},
);

//> -----------------------------------------------------------------
//> Fn:refresh() — Desc: Refresh the access token
//> -----------------------------------------------------------------
export const refresh: Controller<Record<never, never>> = asyncHandler(
	async (req, res) => {
		const refreshToken = req.cookies?.refresh_token;

		if (!refreshToken) {
			throw ApiError.unauthorized("Refresh token is required");
		}

		const { accessToken, refreshToken: newRefreshToken } =
			await authService.refresh(refreshToken);

		setAuthenticationCookies({
			res,
			accessToken,
			refreshToken: newRefreshToken,
		});

		sendResponse(res, {
			statusCode: 200,
			message: "Token refreshed successfully",
			data: {
				accessToken,
				refreshToken: newRefreshToken,
			},
		});
	},
);
