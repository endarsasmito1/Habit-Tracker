import { Router } from "express";
import { auth } from "../auth";
import { toNodeHandler } from "better-auth/node";

const router = Router();

router.all("/api/auth/*", toNodeHandler(auth));

export default router;
