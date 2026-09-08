//! ============================================================
//! 🧱 Notification Model — Schema for notification model
//! ============================================================

import mongoose, { type Document, Schema, type Types } from "mongoose";

// Info: Information about the notification type
export type NotificationType =
	| "APPLICATION_RECEIVED"
	| "APPLICATION_STATUS_CHANGED"
	| "INTERVIEW_SCHEDULED"
	| "INTERVIEW_RESCHEDULED"
	| "INTERVIEW_CANCELLED";

// Info: Interface for the notification model
export interface INotification extends Document {
	userId: Types.ObjectId;

	type: NotificationType;

	title: string;
	message: string;

	isRead: boolean;

	data?: Record<string, unknown>;

	createdAt: Date;
}

//@ -----------------------------------------------------------------
//@ Obj:notificationSchema — Desc: Defines the schema for the notification model
//@ -----------------------------------------------------------------
const notificationSchema = new Schema<INotification>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		type: {
			type: String,
			enum: [
				"APPLICATION_RECEIVED",
				"APPLICATION_STATUS_CHANGED",
				"INTERVIEW_SCHEDULED",
				"INTERVIEW_RESCHEDULED",
				"INTERVIEW_CANCELLED",
			],
			required: true,
		},

		title: {
			type: String,
			required: true,
		},

		message: {
			type: String,
			required: true,
		},

		isRead: {
			type: Boolean,
			default: false,
		},

		data: {
			type: Schema.Types.Mixed,
		},
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: false,
		},
	},
);

// Info: Index to optimize queries for notifications by userId, isRead status, and creation date
notificationSchema.index({
	userId: 1,
	isRead: 1,
	createdAt: -1,
});

// Info: Index to optimize queries for notifications by type and creation date
const Notification = mongoose.model<INotification>(
	"Notification",
	notificationSchema,
);

export default Notification;
