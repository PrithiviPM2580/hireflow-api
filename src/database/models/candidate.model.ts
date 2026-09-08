//! ============================================================
//! 🧱 Candidate Model — Scchema for candidate model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Interface for experience subdocument
interface IExperience {
	company: string;
	position: string;
	startDate: Date;
	endDate?: Date;
	description?: string;
}

// Info: Interface for education subdocument
interface IEducation {
	institution: string;
	degree: string;
	field?: string;
	startDate: Date;
	endDate?: Date;
}

// Info: Interface for candidate model
export interface ICandidate extends Document {
	userId: Types.ObjectId;
	bio?: string;
	phone?: string;
	location?: string;
	skills: string[];
	experiences: IExperience[];
	educations: IEducation[];
	resumeUrl?: string;
	portfolioUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:experienceSchema — Desc: Define the schema for experience subdocument
//@ -----------------------------------------------------------------
const experienceSchema = new Schema<IExperience>(
	{
		company: {
			type: String,
			required: true,
			trim: true,
		},
		position: {
			type: String,
			required: true,
			trim: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
		},
		description: {
			type: String,
			trim: true,
		},
	},
	{
		_id: false,
	},
);

//@ -----------------------------------------------------------------
//@ Obj:educationSchema — Desc: Define the schema for education subdocument
//@ -----------------------------------------------------------------
const educationSchema = new Schema<IEducation>(
	{
		institution: {
			type: String,
			required: true,
			trim: true,
		},
		degree: {
			type: String,
			required: true,
			trim: true,
		},
		field: {
			type: String,
			trim: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
		},
	},
	{
		_id: false,
	},
);

//@ -----------------------------------------------------------------
//@ Obj:candidateSchema — Desc: Define the schema for candidate model
//@ -----------------------------------------------------------------
const candidateSchema = new Schema<ICandidate>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		bio: {
			type: String,
			maxlength: 500,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		location: {
			type: String,
			trim: true,
		},
		skills: {
			type: [String],
			default: [],
		},
		experiences: {
			type: [experienceSchema],
			default: [],
		},
		educations: {
			type: [educationSchema],
			default: [],
		},
		resumeUrl: {
			type: String,
			trim: true,
		},
		portfolioUrl: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	},
);

// Info: Index to optimize queries for candidates by userId
candidateSchema.index({ userId: 1 }, { unique: true });

// Info: Index to optimize queries for candidates by skills
candidateSchema.index({ skills: 1 });

// Info: Index to optimize queries for candidates by location
candidateSchema.index({ location: 1 });

// Info: Index to optimize queries for candidates by experiences.company
const Candidate = mongoose.model<ICandidate>("Candidate", candidateSchema);

export default Candidate;
