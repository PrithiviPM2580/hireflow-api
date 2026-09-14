//! ============================================================
//! 🎮 Auth Controller — HTTP request handlers for authentication
//! ============================================================

import { asyncHandler } from "@/middlewares/async-handler.middleware";
import type { Controller } from "@/types/index.type";
import { sendResponse } from "@/utils/send-response.util";
import type { registerSchema } from "./auth.schema";
import * as authService from "./auth.service";

//> -----------------------------------------------------------------
//> Fn:register() — Desc: Register a new user
//> -----------------------------------------------------------------
export const register: Controller<typeof registerSchema> = asyncHandler(
	async (req, res) => {
		// Info: Call the authService.register function to register a new user
		const user = await authService.register(req.body);

		// Info: Send a success response with the newly created user data
		sendResponse(res, {
			statusCode: 201,
			message: "User created successfully",
			data: user,
		});
	},
);
