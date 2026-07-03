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
 *  /api/surname:
 *     get:
 *       summary: Retrieve surnames
 *       description: Retrieve a list of distinct surnames from the database. Optionally, filter surnames using the `search` query parameter.
 *       tags:
 *         - Members
 *       parameters:
 *         - $ref: '#/components/parameters/AcceptLanguage'
 *         - name: search
 *           in: query
 *           description: Search term to filter surnames (case-insensitive, partial match).
 *           required: false
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successfully retrieved surnames.
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
 *                     example: Surnames retrieved successfully
 *                   data:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: Johnson
 *         '500':
 *           description: Internal server error.
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
 *                     example: Internal server error occurred.
 */
