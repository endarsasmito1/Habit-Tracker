import { Router, Request, Response, NextFunction } from "express";
import { auth } from "../auth";
import { toNodeHandler } from "better-auth/node";

const router = Router();

const authHandler = toNodeHandler(auth);

// Express 5 compatible: use middleware pattern
router.use("/api/auth", (req: Request, res: Response, next: NextFunction) => {
    authHandler(req, res);
});

export default router;
