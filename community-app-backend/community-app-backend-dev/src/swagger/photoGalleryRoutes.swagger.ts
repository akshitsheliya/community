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
 * /api/photos/{album_uuid}:
 *   post:
 *     summary: Upload a photo to a specific album
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         $ref: '#/components/parameters/AcceptLanguage'
 *       - in: path
 *         name: album_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the album to upload the photo to.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               gallery:
 *                 type: string
 *                 format: binary
 *                 description: The photo to upload.
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
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
 *                   example: "Photo uploaded successfully"
 *                 photo_id:
 *                   type: integer
 *                   description: The ID of the uploaded photo.
 *                   example: 123
 *                 photo_url:
 *                   type: string
 *                   description: The URL of the uploaded photo.
 *                   example: "https://example.com/uploads/gallery/2025%20Vacation/photo.jpg"
 *                 album_uuid:
 *                   type: integer
 *                   description: The ID of the album the photo belongs to.
 *                   example: 42
 *       400:
 *         description: Bad request (invalid data)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Album not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/photos/{album_uuid}:
 *   get:
 *     summary: Get photos by album UUID
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         $ref: '#/components/parameters/AcceptLanguage'
 *       - in: path
 *         name: album_uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the album to retrieve photos from
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Photos retrieved successfully
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
 *                   examples:
 *                     photos_found:
 *                       value: "photos_fetched_success"
 *                       summary: Photos found and retrieved
 *                     no_photos:
 *                       value: "no_photos_found"
 *                       summary: No photos in the album
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       photo_id:
 *                         type: integer
 *                         example: 1
 *                       photo_url:
 *                         type: string
 *                         example: "http://example.com/photo.jpg"
 *                       added_on:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-05-23T14:30:00Z"
 *                 total:
 *                   type: integer
 *                   description: Total number of photos in the album
 *                   example: 25
 *       400:
 *         description: Bad request (invalid album UUID)
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
 *                   example: "invalid_album_uuid"
 *                 data:
 *                   type: array
 *                   example: []
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Album not found
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
 *                   example: "album_not_found"
 *                 data:
 *                   type: array
 *                   example: []
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
 *                   example: "internal_server_error"
 *                 data:
 *                   type: array
 *                   example: []
 */