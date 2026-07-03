/**
* @swagger
* /api/language:
*   put:
*     tags:
*       - Language
*     summary: Update App Language
*     description: Updates the app language for the logged-in user in the tbl_logins table.
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
*               app_language:
*                 type: string
*                 example: "en"
*             required:
*               - app_language
*     responses:
*       200:
*         description: App language updated successfully
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
*                   example: App language updated successfully.
*                 data:
*                   type: object
*                   properties:
*                     user_uuid:
*                       type: string
*                       example: "a26a4550-0bb7-4d31-b2cb-8aa5f1c75c88"
*                     app_language:
*                       type: string
*                       example: "en"
*       400:
*         description: Invalid request data
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*       401:
*         description: Unauthorized - Token missing or invalid
*       500:
*         description: Internal server error
*/
