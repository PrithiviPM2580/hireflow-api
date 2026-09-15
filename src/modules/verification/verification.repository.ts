//! ============================================================
//! 🔧 Verification Service —  for verification
//! ============================================================

import type { IVerification } from "@/database/models/verification.model";
import Verification from "@/database/models/verification.model";
import type { CreateVerificationInput } from "./verification.types";

//> -----------------------------------------------------------------
//> Fn:create() — Desc: Create a new verification record
//> -----------------------------------------------------------------
export const create = async (
	verificationData: CreateVerificationInput,
): Promise<IVerification> => {
	// Info: Create a new verification record in the database with the provided verification data
	return (await Verification.create(verificationData)).toObject();
};

//> -----------------------------------------------------------------
//> Fn:findById() — Desc: Find a verification record by its ID
//> -----------------------------------------------------------------
export const findById = async (verificationId: string) => {
	// Info: Find a verification record by its ID
	return await Verification.findById(verificationId);
};

//> -----------------------------------------------------------------
//> Fn:deleteById() — Desc: Delete a verification record by its ID
//> -----------------------------------------------------------------
export const deleteById = async (verificationId: string) => {
	// Info: Delete a verification record by its ID
	return await Verification.findByIdAndDelete(verificationId);
};
