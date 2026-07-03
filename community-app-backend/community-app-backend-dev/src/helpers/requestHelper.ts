export const validateRequest = (
  body: any,
  requiredFields: string[]
): { success: boolean; message?: string } => {
  for (const field of requiredFields) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
    ) {
      return { success: false, message: `${field} is required` };
    }
  }
  return { success: true };
};
