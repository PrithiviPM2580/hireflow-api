//! ============================================================
//! 🗄️ Database — Database connection and configuration
//! ============================================================

import type { Server } from "node:http";
import mongoose, { type ConnectOptions } from "mongoose";
import { appConfig } from "@/config/app.config";
import { ApiError } from "@/utils/api-error.util";
import logger from "@/utils/logger.util";

//@ -----------------------------------------------------------------
//@ Obj:connectOptions — Desc: Options for connecting to the MongoDB database
//@ -----------------------------------------------------------------
const connectOptions: ConnectOptions = {
	dbName: appConfig.DB_NAME, // Database name from environment variables
	appName: appConfig.APP_NAME, // Application name from environment variables
	serverApi: {
		version: "1", // Use Server API version 1
		strict: true, // Enforce strict mode for server API
		deprecationErrors: true, // Report deprecated features as errors
	},
	maxPoolSize: 50, // Maximum number of connections in the pool
	minPoolSize: 1, // Minimum number of connections in the pool
	connectTimeoutMS: 10000, // Connection timeout in milliseconds
	socketTimeoutMS: 45000, // Socket timeout in milliseconds
	retryWrites: true, // Enable retryable writes
};

// Info: Boolean value for connection
let isConnected = false;

//> -----------------------------------------------------------------
//> Fn:connectToDatabase() — Desc: Connection to database
//> -----------------------------------------------------------------
export const connectToDatabase = async () => {
	// Info: Checking connection
	if (isConnected) return mongoose.connection;

	try {
		// Info: Connect using the mongodb uri with options
		await mongoose.connect(appConfig.MONGODB_URI, connectOptions);
		isConnected = true;

		// Info: Log successful connection
		logger.info("Connected to database successfully", {
			label: "Database",
		});
	} catch (error) {
		// Error: Log error and throw ApiError
		logger.error("Error connecting to database:", error, {
			label: "Database",
		});

		// Error: Throw ApiError for bad request
		throw ApiError.badRequest("Error connecting to database");
	}
};

//> -----------------------------------------------------------------
//> Fn:disconnectFromDatabase() — Desc: Disconnection from database
//> -----------------------------------------------------------------
export const disconnectFromDatabase = async () => {
	// Info: Checking connection
	if (!isConnected) return;

	try {
		// Info: Disconnect from the database
		await mongoose.disconnect();
		isConnected = false;

		// Info: Log successful disconnection
		logger.info("Disconnected from database successfully", {
			label: "Database",
		});
	} catch (error) {
		// Error: Log error and throw ApiError
		logger.error("Error disconnecting from database:", error, {
			label: "Database",
		});

		// Error: Throw ApiError for bad request
		throw ApiError.badRequest("Error disconnecting from database");
	}
};

//> -----------------------------------------------------------------
//> Fn:gracefulShutdown() — Desc: Shutdown database gracefully
//> -----------------------------------------------------------------
export const gracefulShutdown = async (server: Server) => {
	try {
		// Info: Disconnect from the database
		await disconnectFromDatabase();

		// Info: Log graceful shutdown message
		logger.info("Shutting down server gracefully...", {
			label: "Server",
		});
	} catch (error) {
		// Error: Log error during graceful shutdown and throw ApiError
		logger.error("Error during graceful shutdown:", error, {
			label: "Server",
		});

		// Error: Throw ApiError for bad request
		throw ApiError.badRequest("Error during graceful shutdown");
	} finally {
		// Info: Close the server and log successful closure
		server.close(() => {
			// Info: Log server closed message and exit process
			logger.info("Server closed successfully", {
				label: "Server",
			});

			// Info: Exit the process with status code 0
			process.exit(0);
		});
	}
};
