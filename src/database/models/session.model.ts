//! ============================================================
//! 🧱 Session Model — Schema for session model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Interface for session model
export interface ISession extends Document {
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

// Info: Index to automatically delete expired sessions after their expiration time
const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
