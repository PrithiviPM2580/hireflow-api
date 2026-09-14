//! ============================================================
//! 🔧 Verification Service —  for verification
//! ============================================================

import Verification from "@/database/models/verification.model";
import type { CreateVerificationInput } from "./verification.types";

export const create = async (verificationData: CreateVerificationInput) => {
	return Verification.create(verificationData);
};
