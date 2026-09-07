//! ============================================================
//! 🔨 Logger Utility —
//! ============================================================

import "winston-daily-rotate-file";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import winston from "winston";
import { appConfig } from "@/config/app.config";

// ------------------------------------------------------
//  Logger Interface
// ------------------------------------------------------
interface LogInfo extends winston.Logform.TransformableInfo {
	message: string;
	label?: string;
}

// ------------------------------------------------------
//  Logger Format Components
// ------------------------------------------------------
const { combine, timestamp, printf } = winston.format;

// ------------------------------------------------------
//  Logger Transports
// ------------------------------------------------------
const transports: winston.transport[] = [];

// ------------------------------------------------------
//  Log Directory
// ------------------------------------------------------
const logDir = path.join(process.cwd(), "logs");

if (appConfig.NODE_ENV === "production" && !fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

// ------------------------------------------------------
//  Logger Custom Format
// ------------------------------------------------------
const customFormat = combine(
	timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

	printf((info) => {
		const { timestamp, level, message, label, ...meta } = info as LogInfo;

		// Format label
		const labelStr = label ? `${label}` : "";

		// Clean metadata
		const cleanMeta = Object.fromEntries(
			Object.entries(meta).filter(([key]) => typeof key === "string"),
		);

		// Stringify metadata
		const metaStr = Object.keys(cleanMeta).length
			? `\n${JSON.stringify(cleanMeta, null, 2)}`
			: "";

		// Color-coded log output
		switch (level) {
			case "info":
				return `🟢 ${chalk.gray(timestamp)} [${chalk.green(
					level.toUpperCase(),
				)}] [${chalk.cyanBright("APP")}: ${chalk.green(
					labelStr,
				)}]: ${chalk.greenBright(message)} ${chalk.greenBright(metaStr)}`;

			case "error":
				return `🔴 ${chalk.gray(timestamp)} [${chalk.red(
					level.toUpperCase(),
				)}] [${chalk.cyanBright("APP")}: ${chalk.red(
					labelStr,
				)}]: ${chalk.redBright(message)} ${chalk.redBright(metaStr)}`;

			case "warn":
				return `🟡 ${chalk.gray(timestamp)} [${chalk.yellow(
					level.toUpperCase(),
				)}] [${chalk.cyanBright("APP")}: ${chalk.yellow(
					labelStr,
				)}]: ${chalk.yellowBright(message)} ${chalk.yellowBright(metaStr)}`;

			default:
				return `${chalk.gray(timestamp)} [${chalk.green(
					level.toUpperCase(),
				)}] [${chalk.cyanBright("APP")}: ${chalk.green(
					labelStr,
				)}]: ${chalk.greenBright(message)} ${chalk.greenBright(metaStr)}`;
		}
	}),
);

// ------------------------------------------------------
//  Configure Transports
// ------------------------------------------------------
if (appConfig.NODE_ENV === "development") {
	// Console transport for development
	transports.push(
		new winston.transports.Console({
			format: customFormat,
			level: appConfig.LOG_LEVEL,
		}),
	);
}

if (appConfig.NODE_ENV === "production") {
	// Application log
	transports.push(
		new winston.transports.File({
			filename: path.join(logDir, "app.log"),
			level: "info",
		}),
	);

	// Error log
	transports.push(
		new winston.transports.File({
			filename: path.join(logDir, "errors.log"),
			level: "error",
		}),
	);

	// Combined log
	transports.push(
		new winston.transports.File({
			filename: path.join(logDir, "combined.log"),
		}),
	);
}

// ------------------------------------------------------
//  Create Logger Instance
// ------------------------------------------------------
const logger = winston.createLogger({
	level: appConfig.LOG_LEVEL,
	format: customFormat,
	transports,
	silent: appConfig.NODE_ENV === "test",
});

export default logger;
