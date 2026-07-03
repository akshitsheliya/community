/**
 * @swagger
 * 
 * components:
 *   parameters:
 *     AcceptLanguage:
 *       in: header
 *       name: Accept-Language
 *       schema:
 *         type: string
 *         example: "gu_IN"
 *       required: false
 * 
 * tags:
 *   - name: User Verification
 *     description: API for managing user verification status
 *
 * /api/unverified:
 *   get:
 *     summary: Retrieve all unverified users
 *     description: Returns a paginated list of users who are not yet verified.
 *     tags: [User Verification]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - name: page_number
 *         in: query
 *         required: false
 *         description: The page number to retrieve (default is 1).
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: page_size
 *         in: query
 *         required: false
 *         description: The number of users per page (default is 10).
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved unverified users.
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
 *                   example: "Unverified users fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           member_uuid:
 *                             type: string
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "johndoe@example.com"
 *                           is_verified:
 *                             type: integer
 *                             example: 0
 *     401:
 *        description: Unauthorized - Missing or invalid token.
 *     500:
 *       description: Internal Server Error.
 *
 * /api/approve/{member_uuid}:
 *   put:
 *     summary: Approve a user
 *     description: Marks a user as verified. The `verified_by` field will be automatically extracted from the authenticated user's token.
 *     tags: [User Verification]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: member_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the member to approve
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: User approved successfully.
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
 *                   example: "User approved successfully."
 *       400:
 *         description: Bad request - Missing required fields.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found or already verified
 *       500:
 *         description: Internal Server Error.
 *
 * /api/reject/{member_uuid}:
 *   put:
 *     summary: Reject a user
 *     description: Marks a user as rejected with a reason. The `verified_by` field will be automatically extracted from the authenticated user's token.
 *     tags: [User Verification]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: member_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the member to reject
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reject_reason
 *             properties:
 *               reject_reason:
 *                 type: string
 *                 example: "Duplicate registration"
 *     responses:
 *       200:
 *         description: User rejected successfully.
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
 *                   example: "User rejected successfully."
 *       400:
 *         description: Bad request - Missing required fields.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found or already rejected
 *       500:
 *         description: Internal Server Error
 */