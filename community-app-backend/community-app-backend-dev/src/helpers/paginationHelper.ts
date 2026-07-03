import { Request } from "express";

export const getPaginationFromRequest = (req: Request, defaultLimit: number = 50) => {
  const page = req.query.page_number ? Math.max(parseInt(req.query.page_number as string), 1) : 1;
  const limit = req.query.page_size ? parseInt(req.query.page_size as string) : defaultLimit;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
