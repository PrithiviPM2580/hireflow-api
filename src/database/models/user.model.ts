//! ============================================================
//! 🧱 User Model — Schema for user model
//! ============================================================

import mongoose, { type Document, Schema } from "mongoose";
import { compareValue, hashValue } from "@/utils/bcrypt.util";

// Info: Information about the user role
export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

// Info: Interface for the user model
export interface IUser extends Document {
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	isVerified: boolean;
	isActive: boolean;
	failedLoginAttempts: number;
	lockedUntil?: Date;
	createdAt: Date;
	updatedAt: Date;

	comparePassword(password: string): Promise<boolean>;
}

//@ -----------------------------------------------------------------
//@ Obj:userSchema — Desc: Defines the schema for the user model
//@ -----------------------------------------------------------------
const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 100,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
		},
		passwordHash: {
			type: String,
			required: true,
			trim: true,
		},
		role: {
			type: String,
			enum: ["CANDIDATE", "RECRUITER", "ADMIN"],
			default: "CANDIDATE",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		failedLoginAttempts: {
			type: Number,
			min: 0,
			default: 0,
		},
		lockedUntil: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_doc, ret) => {
				const obj = ret as Record<string, unknown>;
				delete obj.passwordHash;
				delete obj.__v;
				return obj;
			},
		},
	},
);

//-- ------------------------------------------------------
//--  Pre Save : Hash the password before saving the user document
//-- ------------------------------------------------------
userSchema.pre<IUser>("save", async function () {
	if (!this.isModified("passwordHash")) return;
	this.passwordHash = await hashValue(this.passwordHash);
});

//-- ------------------------------------------------------
//--  Method : Compare the provided password with the stored password hash
//-- ------------------------------------------------------
userSchema.methods.comparePassword = async function (
	password: string,
): Promise<boolean> {
	return compareValue(password, this.passwordHash);
};

// Info: Create and export the User model
const User = mongoose.model<IUser>("User", userSchema);

export default User;
