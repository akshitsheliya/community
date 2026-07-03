import { Request, Response, NextFunction } from "express";
import { Language } from "../utils/translation";

// ✅ Extend Express Request to include lang property
declare module "express-serve-static-core" {
  interface Request {
    lang: Language; // ✅ Ensure lang is always defined
  }
}

// Middleware to set language from request headers
export const languageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.lang = (req.headers["accept-language"] as Language) || "en_US";
  next();
};
