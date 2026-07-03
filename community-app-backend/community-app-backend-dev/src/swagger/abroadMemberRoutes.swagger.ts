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
 *         example: "en_US"
 *       required: false
 */

/**
 * @swagger
 * /api/abroad:
 *   get:
 *     summary: Get all abroad members (Protected)
 *     tags: [Abroad Members]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Abroad members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   abroad_uuid:
 *                     type: string
 *                   member_id:
 *                     type: number
 *                   full_name:
 *                     type: string
 *                   passport_photo:
 *                     type: string
 *                   govt_private:
 *                     type: string
 *                   designation:
 *                     type: string
 *                   career:
 *                     type: string
 *                   experience_year:
 *                     type: number
 *                   success_mantra:
 *                     type: string
 *                   contact_number:
 *                     type: string
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   thoughts_on_committee:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   updated_at:
 *                     type: string
 *                   member_uuid:
 *                     type: string
 *                     description: Member UUID from tbl_member_profile
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/abroad/{abroad_uuid}:
 *   get:
 *     summary: Get an abroad member by abroad_uuid (Protected)
 *     tags: [Abroad Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: abroad_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the abroad member to retrieve
 *     responses:
 *       200:
 *         description: Member retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 abroad_uuid:
 *                   type: string
 *                 member_id:
 *                   type: number
 *                 full_name:
 *                   type: string
 *                 passport_photo:
 *                   type: string
 *                 govt_private:
 *                   type: string
 *                 designation:
 *                   type: string
 *                 career:
 *                   type: string
 *                 experience_year:
 *                   type: number
 *                 success_mantra:
 *                   type: string
 *                 contact_number:
 *                   type: string
 *                 country:
 *                   type: string
 *                 city:
 *                   type: string
 *                 thoughts_on_committee:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *                 member_uuid:
 *                   type: string
 *                   description: Member UUID from tbl_member_profile
 *       400:
 *         description: Bad Request - Missing abroad_uuid
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/abroad:
 *   post:
 *     summary: Add a new abroad member with generated abroad_uuid (Protected)
 *     tags: [Abroad Members]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               passport_photo:
 *                 type: string
 *                 format: binary
 *               govt_private:
 *                 type: string
 *               designation:
 *                 type: string
 *               career:
 *                 type: string
 *               experience_year:
 *                 type: number
 *               success_mantra:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               thoughts_on_committee:
 *                 type: string
 *             required:
 *               - full_name
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 abroad_uuid:
 *                   type: string
 *                 member_id:
 *                   type: number
 *                 full_name:
 *                   type: string
 *                 passport_photo:
 *                   type: string
 *                 govt_private:
 *                   type: string
 *                 designation:
 *                   type: string
 *                 career:
 *                   type: string
 *                 experience_year:
 *                   type: number
 *                 success_mantra:
 *                   type: string
 *                 contact_number:
 *                   type: string
 *                 country:
 *                   type: string
 *                 city:
 *                   type: string
 *                 thoughts_on_committee:
 *                   type: string
 *                 member_uuid:
 *                   type: string
 *                   description: Member UUID from tbl_member_profile
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/abroad/{abroad_uuid}:
 *   put:
 *     summary: Update an abroad member by abroad_uuid (Protected, member_id from token)
 *     tags: [Abroad Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: abroad_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the abroad member to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               passport_photo:
 *                 type: string
 *                 format: binary
 *               govt_private:
 *                 type: string
 *               designation:
 *                 type: string
 *               career:
 *                 type: string
 *               experience_year:
 *                 type: number
 *               success_mantra:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               thoughts_on_committee:
 *                 type: string
 *             required:
 *               - full_name
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 abroad_uuid:
 *                   type: string
 *                 member_id:
 *                   type: number
 *                 full_name:
 *                   type: string
 *                 passport_photo:
 *                   type: string
 *                 govt_private:
 *                   type: string
 *                 designation:
 *                   type: string
 *                 career:
 *                   type: string
 *                 experience_year:
 *                   type: number
 *                 success_mantra:
 *                   type: string
 *                 contact_number:
 *                   type: string
 *                 country:
 *                   type: string
 *                 city:
 *                   type: string
 *                 thoughts_on_committee:
 *                   type: string
 *                 member_uuid:
 *                   type: string
 *                   description: Member UUID from tbl_member_profile
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - You can only update your own records
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/abroad/{abroad_uuid}:
 *   delete:
 *     summary: Delete an abroad member by abroad_uuid (Protected, member_id from token)
 *     tags: [Abroad Members]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: abroad_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the abroad member to delete
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       400:
 *         description: Bad Request - Missing abroad_uuid
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - You can only delete your own records
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal server error
 */