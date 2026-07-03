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
 *     familyUuid:
 *       in: path
 *       name: family_uuid
 *       schema:
 *         type: string
 *         required: true
 *       description: Family UUID
 */

/**
 * @swagger
 * /api/members-list/{family_uuid}:
 *   get:
 *     summary: Get family member details by family UUID
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []  # Requires authentication (JWT Bearer Token)
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - $ref: '#/components/parameters/familyUuid'
 *     responses:
 *       200:
 *         description: Successfully retrieved family member details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   first_name:
 *                     type: string
 *                     example: "John"
 *                   surname:
 *                     type: string
 *                     example: "Doe"
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *                   phone_number:
 *                     type: string
 *                     example: "1234567890"
 *                   email_id:
 *                     type: string
 *                     example: "john@example.com"
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 *       404:
 *         description: No family members found.
 *       500:
 *         description: Internal server error.
 */
