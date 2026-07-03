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
 *       description: Language preference for response messages
 *     selfieUuid:
 *       in: path
 *       name: selfie_uuid
 *       schema:
 *         type: string
 *         format: uuid
 *       required: true
 *       description: Unique identifier for the selfie
 *     albumUuid:
 *       in: path
 *       name: album_uuid
 *       schema:
 *         type: string
 *         format: uuid
 *       required: true
 *       description: Unique identifier for the album
 */

/**
 * @swagger
 * /api/face-recognition/album/{album_uuid}:
 *   post:
 *     summary: Trigger face recognition for unprocessed photos in a specific album (admin only)
 *     tags: [Face Recognition]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - in: path
 *         name: album_uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the album for which face recognition should be triggered
 *     responses:
 *       200:
 *         description: Face recognition completed or no unprocessed photos found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Face recognition completed for album 8fe1ea09-da9d-4283-9c1b-eb7e46a23749"
 *       400:
 *         description: Missing album_uuid or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Album UUID is required"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/selfie/upload:
 *   post:
 *     summary: Upload a selfie for face recognition
 *     tags: [Face Recognition]
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
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: The selfie image file to upload
 *             required:
 *               - selfie
 *     responses:
 *       201:
 *         description: Selfie uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie uploaded successfully"
 *                 selfie_id:
 *                   type: integer
 *                   example: 1
 *                   description: The database ID of the uploaded selfie
 *                 selfie_uuid:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                   description: The UUID of the uploaded selfie
 *                 img_selfie:
 *                   type: string
 *                   example: "http://localhost:3000/uploads/selfies/selfie_550e8400.jpg"
 *                   description: The URL of the uploaded selfie
 *       400:
 *         description: Invalid request - Missing user_id or file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/selfies:
 *   get:
 *     summary: Retrieve all selfies for the authenticated user
 *     tags: [Face Recognition]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Successfully retrieved user's selfies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfies retrieved successfully"
 *                 selfies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       selfie_uuid:
 *                         type: string
 *                         format: uuid
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       img_selfie:
 *                         type: string
 *                         example: "http://localhost:3000/uploads/selfies/selfie_550e8400.jpg"
 *                       added_on:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-14T10:00:00Z"
 *                       processing_status:
 *                         type: string
 *                         enum: [pending, processing, completed, error]
 *                         example: "completed"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/selfie/{selfie_uuid}/album/{album_uuid}:
 *   get:
 *     summary: Get photos matched to a selfie for a specific album
 *     tags: [Face Recognition]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/selfieUuid'
 *       - $ref: '#/components/parameters/albumUuid'
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Successfully retrieved matched photos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Photos fetched successfully"
 *                 photos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photo_id:
 *                         type: integer
 *                         example: 1
 *                       photo_url:
 *                         type: string
 *                         example: "http://localhost:3000/uploads/gallery/14983bb3-ced7-4743-92d1-ec747f02ed73/c5c14823-6be6-4dbb-bbae-06af8f197357.JPG"
 *                       thumb_url:
 *                         type: string
 *                         example: "http://localhost:3000/uploads/gallery/14983bb3-ced7-4743-92d1-ec747f02ed73/thumb_c5c14823-6be6-4dbb-bbae-06af8f197357.JPG"
 *                       album_uuid:
 *                         type: string
 *                         format: uuid
 *                         example: "14983bb3-ced7-4743-92d1-ec747f02ed73"
 *                       distance:
 *                         type: number
 *                         example: 0.2
 *       202:
 *         description: Selfie is still being processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie is still being processed."
 *                 photos:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: []
 *       400:
 *         description: Missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required parameters"
 *       404:
 *         description: Selfie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/selfie/{selfie_uuid}:
 *   delete:
 *     summary: Delete a selfie
 *     tags: [Face Recognition]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/selfieUuid'
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Selfie deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie deleted successfully"
 *       400:
 *         description: Missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required parameters"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Selfie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete failed"
 */

/**
 * @swagger
 * /api/face/process-selfie:
 *   post:
 *     summary: Process the next unprocessed selfie (admin only)
 *     tags: [Face Recognition]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Selfie processed successfully or no unprocessed selfies found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie 550e8400-e29b-41d4-a716-446655440000 processed successfully"
 *                 selfie_id:
 *                   type: integer
 *                   example: 1
 *                   description: The database ID of the processed selfie
 *                 selfie_uuid:
 *                   type: string
 *                   format: uuid
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                   description: The UUID of the processed selfie
 *       400:
 *         description: Selfie file not found or no faces detected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Selfie file not found for 550e8400-e29b-41d4-a716-446655440000"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */