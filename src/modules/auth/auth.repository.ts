//! ============================================================
//! 💾 Repository — Data access layer of authentication
//! ============================================================

import User, { type IUser } from "@/database/models/user.model";
import type { CreateUserInput } from "./auth.types";

//> -----------------------------------------------------------------
//> Fn:isUserExist() — Desc: Check if a user exists by email
//> -----------------------------------------------------------------
export const isUserExist = async (email: string) => {
	// Info: Check if a user exists by email
	return Boolean(await User.exists({ email }));
};

//> -----------------------------------------------------------------
//> Fn:createUser() — Desc: Create a new user
//> -----------------------------------------------------------------
export const create = async (userData: CreateUserInput): Promise<IUser> => {
	// Info: Create a new user in the database with the provided user data
	return (await User.create(userData)).toObject();
};

//> -----------------------------------------------------------------
//> Fn:findById() — Desc: Find a user by their ID
//> -----------------------------------------------------------------
export const findById = async (userId: string) => {
	// Info: Find a user by their ID
	return await User.findById(userId);
};

//> -----------------------------------------------------------------
//> Fn:findByEmail() — Desc: Find a user by their email
//> -----------------------------------------------------------------
export const findByEmail = async (email: string) => {
	// Info: Find a user by their email
	return await User.findOne({ email });
};
