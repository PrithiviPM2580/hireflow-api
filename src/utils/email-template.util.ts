//! ============================================================
//! 🔨 Email Template Utility — Reusable utility functions for email
//! ============================================================

//@ -----------------------------------------------------------------
//@ Interface:VerificationEmailParams — Desc: Parameters for the verification email template
//@ -----------------------------------------------------------------------
interface VerificationEmailParams {
	verificationUrl: string;
}

//> -----------------------------------------------------------------
//> Fn:verificationEmailTemplate() — Desc: Generate the HTML and text content for the verification email
//> -----------------------------------------------------------------
export const verificationEmailTemplate = ({
	verificationUrl,
}: VerificationEmailParams) => {
	return {
		subject: "Verify your email address",

		text: `Welcome to our app!

Thank you for signing up.

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 30 minutes.

If you did not create an account, you can safely ignore this email.
`,

		html: `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Verify your email</title>
			</head>

			<body style="
				margin: 0;
				padding: 0;
				background-color: #f4f4f5;
				font-family: Arial, Helvetica, sans-serif;
				color: #18181b;
			">
				<table
					width="100%"
					cellpadding="0"
					cellspacing="0"
					style="padding: 40px 20px;"
				>
					<tr>
						<td align="center">

							<table
								width="100%"
								cellpadding="0"
								cellspacing="0"
								style="
									max-width: 600px;
									background-color: #ffffff;
									border-radius: 12px;
									overflow: hidden;
									box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
								"
							>
								<!-- Header -->
								<tr>
									<td style="
										background-color: #18181b;
										padding: 30px;
										text-align: center;
									">
										<h1 style="
											margin: 0;
											color: #ffffff;
											font-size: 26px;
										">
											Welcome to Our App
										</h1>
									</td>
								</tr>

								<!-- Content -->
								<tr>
									<td style="padding: 40px 35px;">

										<h2 style="
											margin-top: 0;
											font-size: 22px;
										">
											Verify your email address
										</h2>

										<p style="
											font-size: 16px;
											line-height: 1.6;
											color: #52525b;
										">
											Thank you for signing up! We're excited to
											have you with us.
										</p>

										<p style="
											font-size: 16px;
											line-height: 1.6;
											color: #52525b;
										">
											Please click the button below to verify
											your email address.
										</p>

										<!-- Button -->
										<table
											width="100%"
											cellpadding="0"
											cellspacing="0"
											style="margin: 30px 0;"
										>
											<tr>
												<td align="center">
													<a
														href="${verificationUrl}"
														style="
															display: inline-block;
															background-color: #18181b;
															color: #ffffff;
															text-decoration: none;
															padding: 14px 28px;
															border-radius: 8px;
															font-size: 16px;
															font-weight: bold;
														"
													>
														Verify Email
													</a>
												</td>
											</tr>
										</table>

										<p style="
											font-size: 14px;
											line-height: 1.6;
											color: #71717a;
										">
											This verification link will expire in
											<strong>30 minutes</strong>.
										</p>

										<p style="
											font-size: 14px;
											line-height: 1.6;
											color: #71717a;
										">
											If the button doesn't work, copy and paste
											the following URL into your browser:
										</p>

										<p style="
											word-break: break-all;
											font-size: 13px;
											color: #3f3f46;
										">
											${verificationUrl}
										</p>

									</td>
								</tr>

								<!-- Footer -->
								<tr>
									<td style="
										padding: 25px 35px;
										background-color: #fafafa;
										text-align: center;
										border-top: 1px solid #e4e4e7;
									">
										<p style="
											margin: 0;
											font-size: 13px;
											color: #71717a;
										">
											If you didn't create an account,
											you can safely ignore this email.
										</p>

										<p style="
											margin: 10px 0 0;
											font-size: 12px;
											color: #a1a1aa;
										">
											© 2026 Our App. All rights reserved.
										</p>
									</td>
								</tr>

							</table>

						</td>
					</tr>
				</table>
			</body>
			</html>
		`,
	};
};
