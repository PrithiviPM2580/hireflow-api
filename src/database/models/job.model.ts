//! ============================================================
//! 🧱 Job Model — Schema for job model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Information about the job status
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

// Info: Interface for the job model
export type EmploymentType =
	| "FULL_TIME"
	| "PART_TIME"
	| "CONTRACT"
	| "INTERNSHIP";

// Info: Interface for the job model
export interface IJob extends Document {
	recruiterId: Types.ObjectId;
	companyId: Types.ObjectId;
	title: string;
	description: string;
	location: string;
	employmentType: EmploymentType;
	experienceLevel: string;
	salary?: {
		min?: number;
		max?: number;
		currency?: string;
	};
	skills: string[];
	status: JobStatus;
	applicationsCount: number;
	expiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:jobSchema — Desc: Defines the schema for the job model
//@ -----------------------------------------------------------------
const jobSchema = new Schema<IJob>(
	{
		recruiterId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		companyId: {
			type: Schema.Types.ObjectId,
			ref: "Company",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			maxlength: 100,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		location: {
			type: String,
			required: true,
			maxlength: 100,
			trim: true,
		},
		employmentType: {
			type: String,
			enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"],
			required: true,
		},
		experienceLevel: {
			type: String,
			required: true,
			maxlength: 50,
			trim: true,
		},
		salary: {
			min: {
				type: Number,
				min: 0,
			},
			max: {
				type: Number,
				min: 0,
			},
			currency: {
				type: String,
				maxlength: 10,
				trim: true,
				default: "USD",
			},
		},
		skills: {
			type: [String],
			default: [],
		},
		status: {
			type: String,
			enum: ["DRAFT", "PUBLISHED", "CLOSED"],
			default: "DRAFT",
			index: true,
		},
		applicationsCount: {
			type: Number,
			default: 0,
			min: 0,
		},
		expiresAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	},
);

// Info: Index to optimize text search for jobs by title, description, and skills
jobSchema.index({
	title: "text",
	description: "text",
	skills: "text",
});

// Info: Index to optimize queries for jobs by recruiter and status
jobSchema.index({
	status: 1,
	createdAt: -1,
});

// Info: Index to optimize queries for jobs by company and status
const Job = mongoose.model<IJob>("Job", jobSchema);

export default Job;
