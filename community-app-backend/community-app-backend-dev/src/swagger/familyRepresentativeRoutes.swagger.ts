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
 * /api/representatives:
 *   get:
 *     summary: Get logged-in user's data (Protected)
 *     tags: [family representative]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: representatives retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 first_name:
 *                   type: string
 *                   example: "John"
 *                 father_name:
 *                   type: string
 *                   example: "Doe"
 *                 surname:
 *                   type: string
 *                   example: "Smith"
 *                 id_proof:
 *                   type: string
 *                   example: "Passport"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */