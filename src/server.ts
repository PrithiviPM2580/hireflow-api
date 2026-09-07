//! ============================================================
//! 🌐 Server — HTTP server bootstrap
//! ============================================================

import app from "./app";
import { appConfig } from "./config/app.config";
import { connectToDatabase, gracefulShutdown } from "./database/database";
import logger from "./utils/logger.util";

// Info: Port Number
const PORT = appConfig.PORT || 3000;

const startServer = async () => {
	try {
		/// Info: Connect to the database before starting the server
		await connectToDatabase();

		// Info: Start the server and listen on the specified port
		const server = app.listen(PORT, () => {
			logger.info(
				`Server is running in env [${appConfig.NODE_ENV}] in http://localhost:${PORT}`,
				{
					label: "Server",
				},
			);
		});

		// Info: Handle unhandled promise rejections and uncaught exceptions
		process.on("unhandledRejection", async (reason, promise) => {
			logger.error("Unhandled Rejection at:", promise, "reason:", reason, {
				label: "Server",
			});
			await gracefulShutdown(server);
		});

		// Info: Handle uncaught exceptions and SIGINT signal for graceful shutdown
		process.on("uncaughtException", async (error) => {
			logger.error("Uncaught Exception thrown:", error, {
				label: "Server",
			});
			await gracefulShutdown(server);
		});

		// Info: Handle SIGINT signal for graceful shutdown
		process.on("SIGINT", async () => {
			logger.info("SIGINT signal received. Shutting down gracefully...", {
				label: "Server",
			});
			await gracefulShutdown(server);
		});
	} catch (error) {
		// Error: Log the error and exit the process with a failure code
		logger.error("Error starting server:", error, {
			label: "Server",
		});
		process.exit(1);
	}
};

startServer();
