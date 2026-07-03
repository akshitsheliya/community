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
 * /api/news:
 *   get:
 *     summary: Get all news feeds (Public)
 *     tags: [News]
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful retrieval of news feeds
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
 *                   example: News feeds fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       newsUuid:
 *                         type: string
 *                         description: The UUID of the news item.
 *                         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                       title:
 *                         type: string
 *                         description: The title of the news item.
 *                         example: "Breaking News!"
 *                       content:
 *                         type: string
 *                         description: The content of the news item.
 *                         example: "This is the latest news..."
 *                       feed_photo_video:
 *                         type: string
 *                         description: URL to the feed photo or video.
 *                         example: "http://localhost:3000/Uploads/image.jpg"
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/news/{newsUuid}:
 *   get:
 *     summary: Get specific news by UUID (Public)
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: newsUuid
 *         required: true
 *         description: The UUID of the news item to retrieve.
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Successful retrieval of news item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newsUuid:
 *                   type: string
 *                   description: The UUID of the news item.
 *                   example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                 title:
 *                   type: string
 *                   description: The title of the news item.
 *                   example: "Breaking News!"
 *                 content:
 *                   type: string
 *                   description: The content of the news item.
 *                   example: "This is the latest news..."
 *       404:
 *         description: News item not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create news (Protected)
 *     tags: [News]
 *     security:
 *       - BearerAuth: []  # Requires authentication (Bearer token)
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               channel_id:
 *                 type: integer
 *                 description: The ID of the news channel.
 *                 example: 1
 *               feed_title:
 *                 type: string
 *                 description: The title of the news feed.
 *                 example: "WPL Starts Today"
 *               feed_description:
 *                 type: string
 *                 description: A description of the news feed.
 *                 example: "WPL starts from today"
 *               feed_type:
 *                 type: string
 *                 description: The type of news feed (e.g., "news", "event").
 *                 example: "news"
 *               event_address:
 *                 type: string
 *                 description: The address where the event is taking place.
 *                 example: "India"
 *               event_date_time:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time of the event.
 *                 example: "2025-02-10T12:00:00Z"
 *               event_latitude:
 *                 type: string
 *                 description: The latitude of the event location.
 *                 example: "41"
 *               event_longitude:
 *                 type: string
 *                 description: The longitude of the event location.
 *                 example: "-74"
 *               feed_photo_video:
 *                 type: string
 *                 format: binary
 *                 description: The filename of the news feed photo or video.
 *                 example: "Upload file"
 *     responses:
 *       201:
 *         description: News item created successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/news/{newsUuid}:
 *   delete:
 *     summary: Delete news by UUID (Protected)
 *     tags: [News]
 *     security:
 *       - BearerAuth: []  # Requires authentication (Bearer token)
 *     parameters:
 *       - in: path
 *         name: newsUuid
 *         required: true
 *         description: The UUID of the news item to delete.
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       204:
 *         description: News item deleted successfully (no content returned)
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: News item not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/news/{newsUuid}:
 *   put:
 *     summary: Update news (Protected)
 *     tags: [News]
 *     security:
 *       - BearerAuth: []  # Requires authentication (Bearer token)
 *     parameters:
 *       - in: path
 *         name: newsUuid
 *         required: true
 *         description: The UUID of the news item to delete.
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               channel_id:
 *                 type: integer
 *                 description: The ID of the news channel.
 *                 example: 1
 *               feed_title:
 *                 type: string
 *                 description: The title of the news feed.
 *                 example: "WPL Starts Today"
 *               feed_description:
 *                 type: string
 *                 description: A description of the news feed.
 *                 example: "WPL starts from today"
 *               feed_type:
 *                 type: string
 *                 description: The type of news feed (e.g., "news", "event").
 *                 example: "news"
 *               event_address:
 *                 type: string
 *                 description: The address where the event is taking place.
 *                 example: "India"
 *               event_date_time:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time of the event.
 *                 example: "2025-02-10T12:00:00Z"
 *               event_latitude:
 *                 type: string
 *                 description: The latitude of the event location.
 *                 example: "41"
 *               event_longitude:
 *                 type: string
 *                 description: The longitude of the event location.
 *                 example: "-74"
 *               feed_photo_video:
 *                 type: string
 *                 format: binary
 *                 description: The filename of the news feed photo or video.
 *                 example: "Upload file"
 *     responses:
 *       201:
 *         description: News item updated successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
