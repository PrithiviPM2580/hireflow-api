//! ============================================================
//! 📝 Auth Types — Type definitions for auth
//! ============================================================

export interface CreateUserInput {
	email: string;
	name: string;
	passwordHash: string;
}
