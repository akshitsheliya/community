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
 * /api/committee:
 *   get:
 *     summary: Get all committee members (Protected)
 *     tags: [Committee Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Committee members retrieved successfully
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
 *                   father_name:
 *                     type: string
 *                     example: "Doe"
 *                   surname:
 *                     type: string
 *                     example: "Smith"
 *                   id_proof:
 *                     type: string
 *                     example: "Passport"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: No committee members found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/committee/{member_uuid}:
 *   put:
 *     summary: Update committee member status (Protected)
 *     tags: [Committee Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - in: path
 *         name: member_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the member to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *                 example: "pramukh"
 *             required:
 *               - designation
 *     responses:
 *       200:
 *         description: Committee member updated successfully
 *       400:
 *         description: Bad Request - Invalid request (e.g., member already a committee member)
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User does not have admin authority
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/edit-committee/{member_uuid}:
 *   put:
 *     summary: Edit Committee Member Designation
 *     tags: [Committee Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - in: path
 *         name: member_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the committee member to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *                 example: "pramukh"
 *             required:
 *               - designation
 *     responses:
 *       200:
 *         description: Committee member designation updated successfully
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
 *                   example: "Committee member designation updated successfully."
 *       400:
 *         description: Bad request (Invalid designation or missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid designation."
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Member not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/committee/{member_uuid}:
 *   delete:
 *     summary: Remove a committee member (Protected)
 *     tags: [Committee Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - in: path
 *         name: member_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the member to remove from the committee
 *     responses:
 *       200:
 *         description: Committee member removed successfully
 *       400:
 *         description: Bad Request - Invalid request (e.g., member not found)
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User does not have admin authority
 *       404:
 *         description: Member not found or not a committee member
 *       500:
 *         description: Internal server error
 */
