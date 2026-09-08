//! ============================================================
//! 🔨 Bcrypt Utility — Utility to hask the value
//! ============================================================

import bcrypt from "bcryptjs";

//> -----------------------------------------------------------------
//> Fn:hashValue() — Desc: Hash the given value
//> -----------------------------------------------------------------
export const hashValue = async (
	value: string,
	saltRounds: number = 10,
): Promise<string> => {
	return bcrypt.hash(value, saltRounds);
};

//> -----------------------------------------------------------------
//> Fn:compareValue() — Desc: Compare the hash value
//> -----------------------------------------------------------------
export const compareValue = async (
	value: string,
	hashedValue: string,
): Promise<boolean> => {
	return bcrypt.compare(value, hashedValue);
};
