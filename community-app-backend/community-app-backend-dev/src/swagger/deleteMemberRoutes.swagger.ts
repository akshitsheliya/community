/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   parameters:
 *     AcceptLanguage:
 *       in: header
 *       name: Accept-Language
 *       schema:
 *         type: string
 *         example: "gu_IN"
 *       required: false
 * 
 * paths:
 *   /api/member/{member_uuid}:
 *     delete:
 *       summary: Delete a specific member by UUID (Protected)
 *       tags: [Members]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: member_uuid
 *           required: true
 *           schema:
 *             type: string
 *           description: The UUID of the member to delete
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *       responses:
 *         200:
 *           description: Member deleted successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Member deleted successfully"
 *         400:
 *           description: Bad request - Invalid member UUID
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   message:
 *                     type: string
 *                     example: "Invalid member UUID"
 *         401:
 *           description: Unauthorized - Missing or invalid token
 *         500:
 *           description: Internal server error
 * 
 *   /api/user:
 *     delete:
 *       summary: Delete a user and related data (Protected)
 *       tags: [Members]
 *       security:
 *         - BearerAuth: []
 *       responses:
 *         200:
 *           description: User and related data deleted successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "User and related data deleted successfully"
 *         400:
 *           description: Bad request - Invalid phone number
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   message:
 *                     type: string
 *                     example: "Invalid phone number"
 *         401:
 *           description: Unauthorized - Missing or invalid token
 *         500:
 *           description: Internal server error
 */
