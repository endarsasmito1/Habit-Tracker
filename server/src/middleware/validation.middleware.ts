import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import sanitizeHtml from 'sanitize-html';

// Recursively sanitize strings in an object
const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
        return sanitizeHtml(obj, {
            allowedTags: [], // Strip all tags by default
            allowedAttributes: {}, // No attributes allowed
        });
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    if (obj !== null && typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cleaned[key] = sanitizeObject(obj[key]);
            }
        }
        return cleaned;
    }
    return obj;
};

// Middleware to sanitize req.body, req.query, and req.params
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
    next();
};

// Middleware factory for Zod validation
export const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        // Parse req.body
        schema.parse(req.body);
        next();
    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: (error as any).errors.map((e: any) => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }
        next(error);
    }
};
