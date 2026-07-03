/**
 * @swagger
 * components:
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
 * tags:
 *   name: Families
 *   description: Operations related to family details
 */

/**
 * @swagger
 * /api/families:
 *   get:
 *     summary: Get family details with pagination (Protected)
 *     tags: [Families]
 *     security:
 *       - BearerAuth: []  # Requires authentication (Bearer token)
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - name: page_number
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1)
 *       - name: page_size
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of families per page (default is 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter members by full nam
 *     responses:
 *       200:
 *         description: Successful retrieval of family details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the operation.
 *                   example: "Family details retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       family_sr_id:
 *                         type: integer
 *                         description: The family's serial ID.
 *                         example: 1
 *                       family_uuid:
 *                         type: string
 *                         description: The family's UUID.
 *                         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                       family_main_member_id:
 *                         type: integer
 *                         description: The ID of the main member of the family.
 *                         example: 123
 *                       number_of_family_members:
 *                         type: integer
 *                         description: The number of members in the family.
 *                         example: 4 
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
