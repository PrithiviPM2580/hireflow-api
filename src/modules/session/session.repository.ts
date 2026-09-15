//! ============================================================
//! 💾 Session Repository — Data access layer for sessions
//! ============================================================

import Session, { type ISession } from "@/database/models/session.model";
import type { CreateSessionInput } from "./session.types";

//> -----------------------------------------------------------------
//> Fn:create() — Desc: Create a new session
//> -----------------------------------------------------------------
export const create = async (
	sessionData: CreateSessionInput,
): Promise<ISession> => {
	// Info: Create a new session document in the database and return it as a plain JavaScript object
	return (await Session.create(sessionData)).toObject();
};
