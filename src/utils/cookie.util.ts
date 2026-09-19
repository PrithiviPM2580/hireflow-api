//! ============================================================
//! 🔨 Cookie Utility — Reusable utility functions for cookies
//! ============================================================

import type { CookieOptions, Response } from "express";
import { appConfig } from "@/config/app.config";
import {
	ACCESS_TOKEN_MAX_AGE,
	REFRESH_TOKEN_MAX_AGE,
} from "@/constants/index.constant";
import type { AuthenticationCookiesPayload } from "@/types/index.type";

//@ -----------------------------------------------------------------
//@ Obj:defaultCookieOptions — Desc: Default options for all cookies
//@ -----------------------------------------------------------------
const defaultCookieOptions: CookieOptions = {
	httpOnly: true, // Can only be accessed by the web server
	secure: appConfig.NODE_ENV === "production", // Only sent over HTTPS in production
	sameSite: appConfig.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
};

//> -----------------------------------------------------------------
//> Fn:getAccessTokenCookieOptions() — Desc: Get the cookie options for the access token
//> ------------------------------------------------------------------------
const getAccessTokenCookieOptions = (): CookieOptions => ({
	...defaultCookieOptions,
	maxAge: ACCESS_TOKEN_MAX_AGE, // 15 minutes in milliseconds
	path: "/", // Accessible throughout the entire application
});

//> -----------------------------------------------------------------
//> Fn:getRefreshTokenCookieOptions() — Desc: Get the cookie options for the refresh token
//> -----------------------------------------------------------------
const getRefreshTokenCookieOptions = (): CookieOptions => ({
	...defaultCookieOptions,
	maxAge: REFRESH_TOKEN_MAX_AGE, // 7 days in milliseconds
	path: "/api/v1/auth", // Accessible only to the authentication routes
});

//> -----------------------------------------------------------------
//> Fn:setAuthenticationCookies() — Desc: Set the authentication cookies (access and refresh tokens)
//> -----------------------------------------------------------------
export const setAuthenticationCookies = ({
	res,
	accessToken,
	refreshToken,
}: AuthenticationCookiesPayload) => {
	// Info: Set the access token and refresh token cookies in the response
	res.cookie("access_token", accessToken, getAccessTokenCookieOptions());

	// Info: Set the refresh token cookie in the response with specific options
	res.cookie("refresh_token", refreshToken, getRefreshTokenCookieOptions());
};

//> -----------------------------------------------------------------
//> Fn:clearAuthenticationCookies() — Desc: Clear the authentication cookies (access and refresh tokens)
//> -----------------------------------------------------------------
export const clearAuthenticationCookies = (res: Response) => {
	// Info: Clear the access token and refresh token cookies from the response
	res.clearCookie("access_token", getAccessTokenCookieOptions());

	// Info: Clear the refresh token cookie from the response with specific options
	res.clearCookie("refresh_token", getRefreshTokenCookieOptions());
};
