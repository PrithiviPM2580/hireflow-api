//! ============================================================
//! 🧱 Reset Model — Reset schema for reset model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Interface for the reset model
export interface IReset extends Document {
	userId: Types.ObjectId;
	tokenHash: string;
	expiresAt: Date;
	usedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:resetSchema — Desc: Defines the schema for the reset model
//@ -----------------------------------------------------------------
const resetSchema = new Schema<IReset>(
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
		usedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

// Info: Index to automatically delete expired reset tokens after their expiration time
resetSchema.index(
	{
		expiresAt: 1,
	},
	{ expireAfterSeconds: 0 },
);

// Info: Create and export the Reset model
const Reset = mongoose.model<IReset>("Reset", resetSchema);

export default Reset;
