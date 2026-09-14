//! ============================================================
//! ⚙️ Resend Config —
//! ============================================================

import { Resend } from "resend";
import { ApiError } from "@/utils/api-error.util";
import logger from "@/utils/logger.util";
import { appConfig } from "./app.config";

//@ -----------------------------------------------------------------
//@ Interface:SendEmailOptions — Desc: Interface to send email options
//@ -----------------------------------------------------------------
interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	from?: string;
	text?: string;
}

//@ -----------------------------------------------------------------
//@ Obj:resend — Desc: Resend instance for sending emails
//@ -----------------------------------------------------------------
const resend = new Resend(appConfig.RESEND_API_KEY);

//> -----------------------------------------------------------------
//> Fn:sendEmail() — Desc: Sends an email using the Resend API
//> -----------------------------------------------------------------
export const sendEmail = async ({
	to,
	subject,
	html,
	text,
	from = appConfig.EMAIL_FROM,
}: SendEmailOptions) => {
	try {
		// Info: Send email using Resend API
		const { data, error } = await resend.emails.send({
			to,
			subject,
			html,
			from,
			text,
		});

		// Info: Handle the response from the Resend API
		if (error) {
			// Error: Log the error and throw an internal server error
			logger.error(`Resend Error: ${error.message}`, {
				label: "ResendConfig",
			});

			// Error: Throw an internal server error with a message
			throw ApiError.internalServer("Failed to send email");
		}

		logger.info(`Email sent successfully to ${to}`, {
			label: "ResendConfig",
		});

		// Info: Return the response data from the Resend API
		return data;
	} catch (error: unknown) {
		// Error: Log the error and throw it
		const message = error instanceof Error ? error.message : String(error);

		// Error: Log the error message with a label for context
		logger.error(`Resend Error: ${message}`, {
			label: "ResendConfig",
		});

		// Error: Throw the error to be handled by the caller
		throw error;
	}
};
