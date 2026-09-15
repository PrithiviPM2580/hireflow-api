//! ============================================================
//! 🧱 Session Model — Schema for session model
//! ============================================================

import mongoose, { Schema, type Types } from "mongoose";
import { hashValue } from "@/utils/bcrypt.util";

// Info: Interface for session model
export interface ISession {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	tokenHash: string;
	expiresAt: Date;
	revokedAt?: Date;
	createdAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:sessionSchema — Desc: Defines the schema for the session model
//@ -----------------------------------------------------------------
const sessionSchema = new Schema<ISession>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		tokenHash: {
			type: String,
			trim: true,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		revokedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: false,
		},
	},
);

//-- ------------------------------------------------------
//--  Pre Save : Hash the token before saving the user document
//-- ------------------------------------------------------
sessionSchema.pre("save", async function () {
	if (!this.isModified("tokenHash")) return;

	this.tokenHash = await hashValue(this.tokenHash);
});

// Info: Index to automatically delete expired sessions after their expiration time
const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
