/**
 * @swagger
 * components:
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
 * /api/donors:
 *   post:
 *     summary: Create a new donor (Admin only)
 *     tags: [Donors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               donor_name:
 *                 type: string
 *                 example: "John Doe"
 *               donor_mobile_no:
 *                 type: string
 *                 example: "1111111111"
 *               donation_category:
 *                 type: string
 *                 enum:
 *                   - life time donor
 *                   - one time donor
 *                 example: "life time donor"
 *               donation_year:
 *                 type: string
 *                 example: "2020"
 *               donor_photo:
 *                 type: string
 *                 format: binary
 *                 description: The photo of the donor
 *               donor_type:
 *                 type: string
 *                 example: "Bhojan samarambh"
 *     responses:
 *       201:
 *         description: Donor added successfully
 *       400:
 *         description: Missing required fields or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/donors/{member_uuid}:
 *   post:
 *     summary: Create a new donor from member list (Admin only)
 *     tags: [Donors]
 *     parameters:
 *       - in: path
 *         name: member_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               donation_category:
 *                 type: string
 *                 enum: ["life time donor", "one time donor"]
 *                 example: "life time donor"
 *               donation_year:
 *                 type: string
 *                 example: "2025"
 *                 description: Required only for "one time donor"
 *               donor_type: 
 *                 type: string
 *                 example: "Bhojan samarambh"
 *     responses:
 *       201:
 *         description: Donor added successfully
 *       400:
 *         description: Missing required fields or invalid input
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/donors:
 *   get:
 *     summary: Get all donors with pagination and optional filters
 *     tags: [Donors]
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
 *         description: Number of donors per page (default is 10)
 *       - name: donation_category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter donors by donation category (e.g., life_time_donor)
 *       - name: donation_year
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [2025, 2026]
 *         description: Filter donors by donation year
 *     responses:
 *       200:
 *         description: Donors retrieved successfully
 *       201: 
 *         description: Donors not found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members with pagination and filters
 *     tags: [Donors]
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
 *           default: 50
 *         description: Number of members per page (default is 50)
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by first name, fathername and surnam (partial match)
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *       201: 
 *         description: Members not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/donors/{donor_id}:
 *   delete:
 *     summary: Delete a donor (Admin only)
 *     tags: [Donors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: donor_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donor to delete.
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       '200':
 *         description: Donor deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the deletion was successful.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '401':
 *         description: Unauthorized access.
 *       '403':
 *         description: Forbidden access.
 *       '404':
 *         description: Donor not found.
 *       '500':
 *         description: Internal server error.
 */


/**
 * @swagger
 * /api/donors/{donor_id}:
 *   put:
 *     summary: Update an existing donor (Admin only)
 *     tags: [Donors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: donor_id
 *         in: path
 *         description: "ID of the donor to update"
 *         required: true
 *         type: string
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               donor_name:
 *                 type: string
 *                 example: "John Doe"
 *               donor_mobile_no:
 *                 type: string
 *                 example: "1111111111"
 *               donation_category:
 *                 type: string
 *                 enum:
 *                   - life time donor
 *                   - one time donor
 *                 example: "life time donor"
 *               donation_year:
 *                 type: string
 *                 example: "2020"
 *               donor_photo:
 *                 type: string
 *                 format: binary
 *                 description: "The photo of the donor"
 *               donor_type: 
 *                 type: string
 *                 example: "Bhojan samarambh"
 *     responses:
 *       200:
 *         description: Donor updated successfully
 *       400:
 *         description: Missing required fields or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Donor not found or member_id is not null or 0
 *       500:
 *         description: Internal server error
 */
