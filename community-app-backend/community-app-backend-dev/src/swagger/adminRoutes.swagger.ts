/**
 * @swagger
 * components:
 *   parameters:
 *     AcceptLanguage:
 *       name: Accept-Language
 *       in: header
 *       description: Optional language preference (e.g., "gu_IN").
 *       schema:
 *         type: string
 *         example: "gu_IN"
 *       required: false
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * paths:
 *   /api/community-admin/assign:
 *     post:
 *       summary: Assign Community Admin Role (Protected)
 *       tags: [Community Admin]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/AcceptLanguage'
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - phone_number
 *               properties:
 *                 phone_number:
 *                   type: string
 *                   description: Phone number of the user to be assigned as Community Admin.
 *                   example: "9876543210"
 *       responses:
 *         200:
 *           description: User successfully assigned as Community Admin
 *         400:
 *           description: Bad request - Invalid input
 *         401:
 *           description: Unauthorized - Missing or invalid token
 *         403:
 *           description: Forbidden - User is not a community admin
 *         404:
 *           description: User not verified
 *         500:
 *           description: Internal server error
 * 
 *   /api/admin-data:
 *     get:
 *       summary: Check admin access (Admin Only)
 *       tags: [Community Admin]
 *       security:
 *         - BearerAuth: []
 *       responses:
 *         200:
 *           description: Welcome Admin!
 *         403:
 *           description: Access denied. Admins only.
 *         500:
 *           description: Internal server error
 */
