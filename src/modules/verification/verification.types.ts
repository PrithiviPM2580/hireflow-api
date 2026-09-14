//! ============================================================
//! 📝 Verification Types — Type definitions for verification
//! ============================================================

import type { Types } from "mongoose";

export interface CreateVerificationInput {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	tokenHash: string;
	expiresAt: Date;
}
