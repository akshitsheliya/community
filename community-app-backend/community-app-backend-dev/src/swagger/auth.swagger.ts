/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
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
 * tags:
 *   name: Authentication
 *   description: User authentication and profile creation
 */

/**
 * @swagger
 * /api/register/mobile:
 *   post:
 *     summary: Register a new user with a mobile number
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               appVersionCode:
 *                 type: string
 *                 description: Version code of the app
 *                 example: "1.3.0"
 *               buildNumber:
 *                 type: string
 *                 description: Build number of the app
 *                 example: "250411"
 *               community_uuid:
 *                 type: string
 *                 description: Community UUID identifier
 *                 example: "deb47b71-6670-44c5-9a2c-bf2908dadf97"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/register/verify-otp:
 *   post:
 *     summary: Verify OTP for registration
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               appVersionCode:
 *                 type: string
 *                 description: Version code of the app
 *                 example: "1.3.0"
 *               buildNumber:
 *                 type: string
 *                 description: Build number of the app
 *                 example: "250411"
 *               community_uuid:
 *                 type: string
 *                 description: Community UUID identifier
 *                 example: "deb47b71-6670-44c5-9a2c-bf2908dadf97"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create a user profile (Protected)
 *     tags: [Authentication]
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
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               father_name:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               number_of_family_members:
 *                 type: integer
 *                 example: 4
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Upload the profile photo as an image file
 *     responses:
 *       201:
 *         description: Profile created successfully
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
 *                   example: "Profile created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_verified:
 *                       type: integer
 *                       example: 0
 *                     member_id:
 *                       type: integer
 *                       example: 1
 *                     family_sr_id:
 *                       type: integer
 *                       example: 1
 *                     profile_photo:
 *                       type: string
 *                       example: "http://localhost:3000/uploads/profile_photos/profile_photo-1692871234567.jpg"
 *                     url:
 *                       type: string
 *                       example: "http://localhost:3000"
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request - Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/login/mobile:
 *   post:
 *     summary: Login using a mobile number
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               appVersionCode:
 *                 type: string
 *                 description: Version code of the app
 *                 example: "1.3.0"
 *               buildNumber:
 *                 type: string
 *                 description: Build number of the app
 *                 example: "250411"
 *               community_uuid:
 *                 type: string
 *                 description: Community UUID identifier
 *                 example: "deb47b71-6670-44c5-9a2c-bf2908dadf97"
 *     responses:
 *       200:
 *         description: OTP sent for login
 *       400:
 *         description: User not found
 */

/**
 * @swagger
 * /api/login/verify-otp:
 *   post:
 *     summary: Verify OTP for login
 *     tags: [Authentication]
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               appVersionCode:
 *                 type: string
 *                 description: Version code of the app
 *                 example: "1.3.0"
 *               buildNumber:
 *                 type: string
 *                 description: Build number of the app
 *                 example: "250411"
 *               community_uuid:
 *                 type: string
 *                 description: Community UUID identifier
 *                 example: "deb47b71-6670-44c5-9a2c-bf2908dadf97"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /api/delete-account:
 *   post:
 *     summary: Request account deletion (Protected)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason_for_delete_account:
 *                 type: string
 *                 example: "I no longer need this account"
 *     responses:
 *       200:
 *         description: Account deletion request submitted successfully
 *       400:
 *         description: Bad request (missing fields, invalid token, etc.)
 *       401:
 *         description: Unauthorized (invalid or missing token)
 */