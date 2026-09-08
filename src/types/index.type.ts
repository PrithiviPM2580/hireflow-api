//! ============================================================
//! 📝 Types — Type definitions
//! ============================================================

import type { TypedRequestHandler } from "zod-express-validator";

// Info: Generic type for controller
export type Controller<T> = TypedRequestHandler<T>;
