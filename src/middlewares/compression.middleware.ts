//! ============================================================
//! 🛡️ Compression Middleware — Compress response bodies
//! ============================================================

import zlib from "node:zlib";
import compression from "compression";
import type { Request, Response } from "express";

//> -----------------------------------------------------------------
//> Fn:shouldCompress() — Desc: Check if a response should be compressed
//> -----------------------------------------------------------------
const shouldCompress = (req: Request, res: Response): boolean => {
	// Info: Skip compression if the request has the "x-no-compression" header
	if (req.headers["x-no-compression"]) {
		return false;
	}

	// Info: Skip compression for certain content types (e.g., images, videos, audio, zip, pdf)
	const contentType = String(res.getHeader("Content-Type") || "").toLowerCase();

	// Info: Skip compression for specific content types
	if (
		contentType.startsWith("image/") ||
		contentType.startsWith("video/") ||
		contentType.startsWith("audio/") ||
		contentType.startsWith("application/zip") ||
		contentType.startsWith("application/pdf")
	) {
		return false;
	}

	// Info: Use the default compression filter for other cases
	return compression.filter(req, res);
};

//> -----------------------------------------------------------------
//> Fn:compressResponse() — Desc: Compress response bodies
//> -----------------------------------------------------------------
const compressResponse = compression({
	threshold: "1kb", // Compress responses larger than 1KB
	level: 6, // Compression level (1-9) for gzip
	brotli: {
		params: {
			[zlib.constants.BROTLI_PARAM_QUALITY]: 5, // Compression level (0-11) for Brotli
		},
	},
	filter: shouldCompress, // Use the custom filter function to determine if compression should be applied
});

export default compressResponse;
