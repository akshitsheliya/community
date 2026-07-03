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
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * paths:
 *   /api/process-marksheet:
 *     post:
 *       summary: Get data from marksheet (Protected)
 *       tags: [Marksheet]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/AcceptLanguage'
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 marksheet_photo:
 *                   type: string
 *                   format: binary
 *       responses:
 *         400:
 *           description: No file uploaded
 *         500:
 *           description: Failed to process image
 *
 *   /api/marksheets:
 *     post:
 *       summary: Store marksheet data (Protected)
 *       tags: [Marksheet]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/AcceptLanguage'
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 marksheet_year:
 *                   type: string
 *                   example: "2023-2024"
 *                 student_name:
 *                   type: string
 *                   example: "John Doe"
 *                 standard:
 *                   type: string
 *                   example: "10"
 *                 medium:
 *                   type: string
 *                   example: "English"
 *                 percentage:
 *                   type: number
 *                   example: 85
 *                 father_full_name:
 *                   type: string
 *                   example: "John Doe Sr."  
 *                 father_phone_number:
 *                   type: number
 *                   example: 1234567890
 *                 stream:
 *                   type: string
 *                   example: "Science"
 *                 marksheet_photo:
 *                   type: string
 *                   example: "https://example.com/marksheet.jpg"
 *       responses:
 *         201:
 *           description: Marksheet data stored successfully
 *         400:
 *           description: Invalid request data
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: User not found
 *         500:
 *           description: Internal server error
 *     get:
 *       summary: Retrieve marksheet data for the logged-in user (Protected)
 *       tags: [Marksheet]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/AcceptLanguage'
 *       responses:
 *         200:
 *           description: Marksheet data retrieved successfully
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: No marksheet data found
 *         500:
 *           description: Internal server error
 *
 */
/**
 * @swagger
 * /api/all-marksheets:
 *   get:
 *     summary: Fetch all marksheets with optional filters and pagination
 *     tags: [Marksheet]
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of marksheets per page (default is 50)
 *       - in: query
 *         name: standard
 *         schema:
 *           type: string
 *         description: Filter by standard
 *       - in: query
 *         name: stream
 *         schema:
 *           type: string
 *         description: Filter by stream
 *       - in: query
 *         name: medium
 *         schema:
 *           type: string
 *         description: Filter by medium
 *       - in: query
 *         name: marksheet_year
 *         schema:
 *           type: string
 *         description: Filter by marksheet year
 *       - in: query
 *         name: is_approved
 *         schema:
 *           type: integer
 *         description: Filter by approval status (0 = Not Approved, 1 = Approved)
 *       - in: query
 *         name: rejection_reason
 *         schema:
 *           type: string  
 *         description: Filter by rejection reason (can be any value)
 *     responses:
 *       200:
 *         description: List of marksheets retrieved successfully
 *       201:
 *         description: No marksheets found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 *   /api/marksheets/approve/{marksheet_uuid}:
 *     put:
 *       summary: Approve a marksheet (Admin Only)
 *       tags: [Marksheet]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: marksheet_uuid
 *           required: true
 *           schema:
 *             type: string
 *           description: ID of the marksheet to approve
 *       responses:
 *         200:
 *           description: Marksheet approved successfully
 *         403:
 *           description: Access denied. Admins only.
 *         404:
 *           description: Marksheet not found
 *         500:
 *           description: Internal server error
 */

/**
 * @swagger
 *   /api/marksheets/reject/{marksheet_uuid}:
 *     put:
 *       summary: Reject a marksheet (Admin Only)
 *       tags: [Marksheet]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: marksheet_uuid
 *           required: true
 *           schema:
 *             type: string
 *           description: ID of the marksheet to reject
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rejection_reason:
 *                   type: string
 *                   example: "Invalid marksheet data"
 *       responses:
 *         200:
 *           description: Marksheet rejected successfully
 *         400:
 *           description: Rejection reason is required
 *         403:
 *           description: Access denied. Admins only.
 *         404:
 *           description: Marksheet not found
 *         500:
 *           description: Internal server error
 */

/**
 * @swagger
 *   /api/marksheets/edit/{marksheet_uuid}:
 *     put:
 *       summary: Edit a marksheet (Admin Only)
 *       tags: [Marksheet]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: marksheet_uuid
 *           required: true
 *           schema:
 *             type: string
 *           description: ID of the marksheet to edit
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student_name:
 *                   type: string
 *                   example: "DESAI PARTH VINODBHAI"
 *                 standard:
 *                   type: string
 *                   example: "10"
 *                 marksheet_year:
 *                   type: string
 *                   example: "2016"
 *                 medium:
 *                   type: string
 *                   example: "Gujarati"
 *                 percentage:
 *                   type: number
 *                   example: 92.27
 *                 stream:
 *                   type: string
 *                   example: null
 *                 father_full_name:
 *                   type: string
 *                   example: "DESAI VINODBHAI BABUBHAI"
 *                 father_phone_number:
 *                   type: number
 *                   example: 1234567890
 *       responses:
 *         200:
 *           description: Marksheet updated successfully
 *         400:
 *           description: Invalid request data
 *         403:
 *           description: Access denied. Admins only.
 *         404:
 *           description: Marksheet not found
 *         500:
 *           description: Internal server error
 */

/**
 * @swagger
 *   /api/marksheets/{marksheet_uuid}:
 *     delete:
 *       summary: Delete a marksheet (User-Specific)
 *       tags: [Marksheet]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: marksheet_uuid
 *           required: true
 *           schema:
 *             type: string
 *           description: ID of the marksheet to delete
 *       responses:
 *         200:
 *           description: Marksheet deleted successfully
 *         403:
 *           description: Access denied. Only the uploader can delete this marksheet.
 *         404:
 *           description: Marksheet not found
 *         500:
 *           description: Internal server error
 */