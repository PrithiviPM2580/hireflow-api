//! ============================================================
//! 💾 Repository — Data access layer of authentication
//! ============================================================

import User from "@/database/models/user.model";
import type { CreateUserInput } from "./auth.types";

//> -----------------------------------------------------------------
//> Fn:isUserExist() — Desc: Check if a user exists by email
//> -----------------------------------------------------------------
export const isUserExist = async (email: string): Promise<boolean> => {
	// Info: Check if a user exists by email
	return Boolean(await User.exists({ email }));
};

//> -----------------------------------------------------------------
//> Fn:createUser() — Desc: Create a new user
//> -----------------------------------------------------------------
export const create = async (userData: CreateUserInput) => {
	// Info: Create a new user in the database with the provided user data
	return User.create(userData);
};
