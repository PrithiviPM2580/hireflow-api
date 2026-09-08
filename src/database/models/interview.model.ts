//! ============================================================
//! 🧱 Interview Model — Schema for interview model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Information about the interview status
export type InterviewStatus =
	| "SCHEDULED"
	| "RESCHEDULED"
	| "COMPLETED"
	| "CANCELLED";

// Info: Interface for the interview model
export interface IInterview extends Document {
	applicationId: Types.ObjectId;

	candidateId: Types.ObjectId;
	recruiterId: Types.ObjectId;

	scheduledAt: Date;
	duration: number;
	timezone: string;

	meetingUrl?: string;

	status: InterviewStatus;

	notes?: string;

	createdAt: Date;
	updatedAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:interviewSchema — Desc: Defines the schema for the interview model
//@ -----------------------------------------------------------------
const interviewSchema = new Schema<IInterview>(
	{
		applicationId: {
			type: Schema.Types.ObjectId,
			ref: "Application",
			required: true,
			index: true,
		},

		candidateId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		recruiterId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		scheduledAt: {
			type: Date,
			required: true,
		},

		duration: {
			type: Number,
			required: true,
			min: 15,
			max: 240,
		},

		timezone: {
			type: String,
			required: true,
		},

		meetingUrl: {
			type: String,
		},

		status: {
			type: String,
			enum: ["SCHEDULED", "RESCHEDULED", "COMPLETED", "CANCELLED"],
			default: "SCHEDULED",
		},

		notes: {
			type: String,
			maxlength: 3000,
		},
	},
	{
		timestamps: true,
	},
);

// Info: Indexes for the interview schema to optimize queries
interviewSchema.index({
	candidateId: 1,
	scheduledAt: 1,
});

// Info: Indexes for the interview schema to optimize queries
interviewSchema.index({
	recruiterId: 1,
	scheduledAt: 1,
});

// Info: Create and export the Interview model
const Interview = mongoose.model<IInterview>("Interview", interviewSchema);

export default Interview;
