//! ============================================================
//! 🧱 Application Model — Schema for application model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Information about the application status
export type ApplicationStatus =
	| "APPLIED"
	| "SCREENING"
	| "INTERVIEW"
	| "OFFER"
	| "HIRED"
	| "REJECTED"
	| "WITHDRAWN";

// Info: Interface for the application model
export interface IApplication extends Document {
	jobId: Types.ObjectId;
	candidateId: Types.ObjectId;
	resumeUrl?: string;
	coverLetter?: string;
	status: ApplicationStatus;
	appliedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:applicationSchema — Desc: Defines the schema for the application model
//@ -----------------------------------------------------------------
const applicationSchema = new Schema<IApplication>(
	{
		jobId: {
			type: Schema.Types.ObjectId,
			ref: "Job",
			required: true,
		},
		candidateId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		resumeUrl: {
			type: String,
			trim: true,
		},
		coverLetter: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: [
				"APPLIED",
				"SCREENING",
				"INTERVIEW",
				"OFFER",
				"HIRED",
				"REJECTED",
				"WITHDRAWN",
			],
			default: "APPLIED",
			index: true,
		},
		appliedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

// Info: Indexes for the application schema to optimize queries
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Info: Index to optimize queries for applications by candidate and creation date
applicationSchema.index({ candidateId: 1, createdAt: -1 });

// Info: Index to optimize queries for applications by job and status
applicationSchema.index({ jobId: 1, status: 1 });

// Info: Index to optimize queries for applications by candidate and status
const Application = mongoose.model<IApplication>(
	"Application",
	applicationSchema,
);

export default Application;
