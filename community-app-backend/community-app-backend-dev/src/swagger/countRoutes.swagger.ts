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
 */

/**
 * @swagger
 * /api/counts:
 *   get:
 *     summary: Get dashboard statistics (unverified users and pending marksheets)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []  # Requires authentication (JWT Bearer Token)
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Counts fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     unverifiedUsers:
 *                       type: integer
 *                       description: Count of unverified users.
 *                       example: 5
 *                     marksheetsCount:
 *                       type: integer
 *                       description: Count of pending marksheets.
 *                       example: 12
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 *       500:
 *         description: Internal server error.
 */
