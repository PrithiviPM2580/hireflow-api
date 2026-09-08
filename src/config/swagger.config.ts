//! ============================================================
//! ⚙️ Swagger Config —
//! ============================================================

import swaggerUi from "swagger-ui-express";
import { openapiDocument } from "@/openapi/openapi.document";

//-- ------------------------------------------------------
//--  Swaggeroptions : Swagger UI options
//-- ------------------------------------------------------
const swaggerOptions = [swaggerUi.serve, swaggerUi.setup(openapiDocument)];

export default swaggerOptions;
