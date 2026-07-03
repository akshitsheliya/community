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
 * /api/members:
 *   post:
 *     summary: Create a user profile (Protected)
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []  # Indicates that authentication (Bearer token) is required
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *                 description: Phone number (1-9 digits, only numbers 1-9 allowed)
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               father_name:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "John"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               address:
 *                 type: string
 *                 example: "123 Main St, Anytown"
 *               business_or_job_or_any:
 *                 type: string
 *                 example: "Software Engineer"
 *               profession_sector:
 *                 type: string
 *                 enum: ["govt", "private"]
 *                 example: "private"
 *               business_category_id:
 *                 type: string
 *                 example: "2"
 *               business_details:
 *                 type: string
 *                 example: "diamond works"
 *               education:
 *                 type: string
 *                 example: "Bachelor's Degree"
 *               blood_group:
 *                 type: string
 *                 example: "O+"
 *               marital_status:
 *                 type: string
 *                 example: "Single"
 *               id_proof:
 *                 type: string
 *                 format: binary  # Indicating that this will be a file upload.
 *               profile_photo:
 *                 type: string
 *                 format: binary  # Indicating that this will be a file upload.
 *               email_id:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               current_resident:
 *                 type: string
 *                 example: "Other"
 *               is_committee_member:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0
 *               is_committee_admin:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0
 *               relationship:
 *                 type: string
 *                 example: "mother"
 *               is_family_representative:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       401:
 *         description: Unauthorized
 */
