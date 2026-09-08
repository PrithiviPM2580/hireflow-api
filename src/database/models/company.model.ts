//! ============================================================
//! 🧱 Company Model — Schema for company model
//! ============================================================

import mongoose, { type Document, Schema } from "mongoose";

// Info: Interface for company model
export interface ICompany extends Document {
	name: string;
	description?: string;
	website?: string;
	logoUrl?: string;
	location?: string;
	industry?: string;
	createdAt: Date;
	updatedAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:companySchema — Desc: Defines the schema for the company model
//@ -----------------------------------------------------------------
const companySchema = new Schema<ICompany>(
	{
		name: {
			type: String,
			required: true,
			maxlength: 100,
			trim: true,
		},
		description: {
			type: String,
			maxlength: 500,
			trim: true,
		},
		website: {
			type: String,
			trim: true,
		},
		logoUrl: {
			type: String,
			trim: true,
		},
		location: {
			type: String,
			trim: true,
		},
		industry: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	},
);

// Info: Create and export the Company model
const Company = mongoose.model<ICompany>("Company", companySchema);

export default Company;
