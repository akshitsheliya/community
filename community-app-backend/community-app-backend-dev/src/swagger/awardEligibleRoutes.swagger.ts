/**
 * @swagger
 * /api/award-eligible:
 *   get:
 *     summary: Get award-eligible students
 *     tags: [Award Eligible Students]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: standard
 *         schema:
 *           type: string
 *         description: Filter by standard (e.g., "10", "11", "12")
 *       - in: query
 *         name: stream
 *         schema:
 *           type: string
 *           enum: [science, commerce, arts]
 *         description: Filter by stream (only for 11th and 12th)
 *       - in: query
 *         name: medium
 *         schema:
 *           type: string
 *           enum: [english, gujarati]
 *         description: Filter by medium
 *       - in: query
 *         name: marksheet_year
 *         schema:
 *           type: string
 *         description: Filter by marksheet year
 *     responses:
 *       200:
 *         description: Successfully retrieved award-eligible students.
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
 *                   example: "students_retrieved"
 *                 data:
 *                   type: object
 *                   properties:
 *                     english:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student_name:
 *                             type: string
 *                             example: "John Doe"
 *                           standard:
 *                             type: string
 *                             example: "12"
 *                           medium:
 *                             type: string
 *                             example: "English"
 *                           stream:
 *                             type: string
 *                             example: "Commerce"
 *                           percentage:
 *                             type: number
 *                             example: 90.5
 *                     gujarati:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student_name:
 *                             type: string
 *                             example: "Raj Patel"
 *                           standard:
 *                             type: string
 *                             example: "12"
 *                           medium:
 *                             type: string
 *                             example: "Gujarati"
 *                           stream:
 *                             type: string
 *                             example: "Science"
 *                           percentage:
 *                             type: number
 *                             example: 92.3
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/generate-pdf:
 *   get:
 *     summary: Generate a PDF of top 5 students for all active standards
 *     tags: [Award Eligible Students]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated PDF with top 5 students for all active standards, including sections like "Standard 1 - 2025, English", "Standard 1 - 2025, Gujarati", etc.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *               description: PDF file named "top5_all_standards.pdf"
 *       401:
 *         description: Unauthorized access due to missing or invalid authentication.
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
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error.
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
 *                   example: "Internal server error"
 */