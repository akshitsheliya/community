//swagger

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
 * /api/user:
 *   get:
 *     summary: Retrieve logged-in user's data (Protected)
 *     description: Fetches detailed information of the authenticated user.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully.
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
 *                 gender:
 *                   type: string
 *                   example: "Male"
 *                 member_uuid:
 *                   type: string
 *                   format: uuid
 *                   example: "9ebfd412-8a2d-4f70-ae08-ef7f6df1dd14"
 *                 phone_number:
 *                   type: string
 *                   example: "+1234567890"
 *                 user_uuid:
 *                   type: string
 *                   format: uuid
 *                   example: "9ebfd412-8a2d-4f70-ae08-ef7f6df1dd14"
 *                 profile_photo:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/profile_photos/a6c1e595-51d3-44a1-80bf-80460caccd71.jpeg"
 *                 number_of_family_members:
 *                   type: integer
 *                   example: 4
 *                 date_of_birth:
 *                   type: string
 *                   format: date-time
 *                   example: "1989-12-31T18:30:00.000Z"
 *                 address:
 *                   type: string
 *                   example: "123 Main St, City, Country"
 *                 occupation:
 *                   type: string
 *                   example: "Software Engineer"
 *                 business_details:
 *                   type: string
 *                   example: "Works at ABC Corp"
 *                 education:
 *                   type: string
 *                   example: "Master's in Computer Science"
 *                 blood_group:
 *                   type: string
 *                   example: "O+"
 *                 marital_status:
 *                   type: string
 *                   example: "Married"
 *                 id_proof:
 *                   oneOf:
 *                     - type: string
 *                     - type: "null"
 *                   example: null
 *                 email_id:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                 relationship:
 *                   type: string
 *                   example: "Self"
 *                 is_community_admin:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 *       500:
 *         description: Internal server error.
 */

/**
/**
 * @swagger
 * /api/user/{member_uuid}:
 *   put:
 *     summary: Update logged-in user's data (Protected)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: member_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               father_name:
 *                 type: string
 *                 example: "Doe"
 *               surname:
 *                 type: string
 *                 example: "Smith"
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, Country"
 *               business_or_job_or_any:
 *                 type: string
 *                 example: "Software Engineer"
 *               business_details:
 *                 type: string
 *                 example: "Works at ABC Corp"
 *               education:
 *                 type: string
 *                 example: "Master's in Computer Science"
 *               blood_group:
 *                 type: string
 *                 example: "O+"
 *               marital_status:
 *                 type: string
 *                 example: "Married"
 *               id_proof:
 *                 type: string
 *                 format: binary
 *               email_id:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               current_resident:
 *                 type: string
 *                 example: "Surat"
 *               relationship:
 *                 type: string
 *                 example: "Self"
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *               number_of_family_members:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: User profile updated successfully
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
 *                   example: "User profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile_photo:
 *                       type: string
 *                       example: "https://yourdomain.com/uploads/profile_photos/uuid.jpg"
 *                     id_proof:
 *                       type: string
 *                       example: "https://yourdomain.com/uploads/idproof/uuid.jpg"
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */