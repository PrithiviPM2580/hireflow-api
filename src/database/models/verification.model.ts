//! ============================================================
//! 🧱 Verification Model — Schema for verification model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Interface for the verification model
export interface IVerification extends Document {
	userId: Types.ObjectId;
	tokenHash: string;
	expiresAt: Date;
	usedAt?: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:verificationSchema — Desc: Defines the schema for the verification model
//@ -----------------------------------------------------------------
const verificationSchema = new Schema<IVerification>(
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

// Info: Index to automatically delete expired verification tokens after their expiration time
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Info: Create and export the EmailVerificationToken model
const EmailVerificationToken = mongoose.model<IVerification>(
	"EmailVerificationToken",
	verificationSchema,
);

export default EmailVerificationToken;
