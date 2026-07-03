import { Response } from "express";

export const sendResponse = (
  res: Response,
  status: number,
  success: boolean,
  message: string,
  data?: any,
  total?: number // Add total as an optional parameter
) => {
  const response: { success: boolean; message: string; data: any; total?: number } = {
    success,
    message,
    data,
  };

  if (total !== undefined) {
    response['total'] = total; // Add total below the message if provided
  }

  res.status(status).json(response);
};
