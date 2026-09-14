//! ============================================================
//! 🔧 Verification Service —  for verification
//! ============================================================

import type { IVerification } from "@/database/models/verification.model";
import Verification from "@/database/models/verification.model";
import type { CreateVerificationInput } from "./verification.types";

export const create = async (
	verificationData: CreateVerificationInput,
): Promise<IVerification> => {
	const verification = await Verification.create(verificationData);

	return verification.toObject();
};
