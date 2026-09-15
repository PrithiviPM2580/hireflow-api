//! ============================================================
//! 📝 SessionTypes — Type definitions for session
//! ============================================================

import type { ISession } from "@/database/models/session.model";

export type CreateSessionInput = Pick<
	ISession,
	"_id" | "userId" | "tokenHash" | "expiresAt"
>;
