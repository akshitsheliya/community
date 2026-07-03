/**
 * @swagger
 * /api/submit-token:
 *   post:
 *     summary: Store FCM device token and app version for the logged-in user (Protected)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *               - device_type
 *               - appVersionCode
 *               - buildNumber
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: FCM device token
 *                 example: "f7Rxxng_TOa6sKBagOf0X0:APA91bEi7GC6aAp_sTAlMRYBAKVpp7koEZyBQ6NtT39027zvRIGvqgomMGlnoZ6WoM5qvTDYTR6CsIRZ2cY1rRpZ1hRR1uli-9-bFjno-Z1gGu_i9-QJH4Q"
 *               device_type:
 *                 type: number
 *                 description: "1 for iOS, 2 for Android"
 *                 example: 2
 *               appVersionCode:
 *                 type: string
 *                 description: Version code of the app
 *                 example: "1.1"
 *               buildNumber:
 *                 type: string
 *                 description: Build number of the app
 *                 example: "222"
 *     responses:
 *       200:
 *         description: FCM token and app version updated successfully
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
 *                   example: "FCM token and app version updated successfully"
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/notification:
 *   post:
 *     summary: Send a push notification to one or multiple users (Protected)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_uuid
 *               - title
 *               - body
 *             properties:
 *               user_uuid:
 *                 oneOf:
 *                   - type: string
 *                     example: "user_uuid_1"
 *                   - type: array
 *                     items:
 *                       type: string
 *                     example: ["user_uuid_1", "user_uuid_2"]
 *                 description: "Single user UUID or an array of user UUIDs to send the notification"
 *               title:
 *                 type: string
 *                 example: "Test Notification"
 *               body:
 *                 type: string
 *                 example: "This is a test notification."
 *     responses:
 *       200:
 *         description: Notification sent successfully
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
 *                   example: "Notification sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     responses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           success:
 *                             type: boolean
 *                             example: true
 *                           messageId:
 *                             type: string
 *                             example: "projects/community-app-f3860/messages/0:1742967622850061%5cb71f605cb71f60"
 *                     successCount:
 *                       type: number
 *                       example: 1
 *                     failureCount:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: No FCM token(s) found for the provided user_uuid(s)
 *       500:
 *         description: Internal server error
 */
