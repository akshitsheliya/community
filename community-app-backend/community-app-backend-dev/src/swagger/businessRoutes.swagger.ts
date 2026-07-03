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
 */
/**
 * @swagger
 * /api/business-categories:
 *   get:
 *     summary: Get all business categories (Protected)
 *     tags: [Business]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Business categories fetched successfully
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
 *                   example: Business categories fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     english:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                     gujarati:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Get all business members (Protected)
 *     tags: [Business]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search text (matches business_name & category)
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Business members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   business_uuid:
 *                     type: string
 *                   added_by:
 *                     type: number
 *                   community_id:
 *                     type: number
 *                   business_name:
 *                     type: string
 *                   business_photo:
 *                     type: string
 *                   business_logo:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   business_type:
 *                     type: string
 *                   category:
 *                     type: string
 *                   address:
 *                     type: string
 *                   contact_number:
 *                     type: string
 *                   contact_email:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   updated_at:
 *                     type: string
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/business/{business_uuid}:
 *   get:
 *     summary: Get a business by UUID (Protected)
 *     tags: [Business]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: business_uuid
 *         required: true
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/AcceptLanguage'
 *     responses:
 *       200:
 *         description: Business retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 business_uuid:
 *                   type: string
 *                 added_by:
 *                   type: number
 *                 community_id:
 *                   type: number
 *                 business_name:
 *                   type: string
 *                 business_photo:
 *                   type: string
 *                 business_logo:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 business_type:
 *                   type: string
 *                 address:
 *                   type: string
 *                 contact_number:
 *                   type: string
 *                 contact_email:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/business:
 *   post:
 *     summary: Add a new business entry (Protected)
 *     tags: [Business]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               business_name:
 *                 type: string
 *               business_photo:
 *                 type: string
 *                 format: binary
 *               business_logo:
 *                 type: string
 *                 format: binary
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               business_type:
 *                 type: string
 *               category:
 *                 type: string
 *               address:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               services_products:
 *                 type: string
 *     responses:
 *       201:
 *         description: Business added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 business_uuid:
 *                   type: string
 *                 added_by:
 *                   type: number
 *                 community_id:
 *                   type: number
 *                 business_name:
 *                   type: string
 *                 business_photo:
 *                   type: string
 *                 business_logo:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 business_type:
 *                   type: string
 *                 address:
 *                   type: string
 *                 contact_number:
 *                   type: string
 *                 contact_email:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/business/{business_uuid}:
 *   put:
 *     summary: Update a business entry (Protected, only by owner)
 *     tags: [Business]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: business_uuid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               business_name:
 *                 type: string
 *               business_photo:
 *                 type: string
 *                 format: binary
 *               business_logo:
 *                 type: string
 *                 format: binary
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               business_type:
 *                 type: string
 *               category:
 *                 type: string
 *               address:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               services_products:
 *                 type: string
 *     responses:
 *       200:
 *         description: Business updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 business_id:
 *                   type: number
 *                 added_by:
 *                   type: number
 *                 business_name:
 *                   type: string
 *                 business_photo:
 *                   type: string
 *                 business_logo:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 business_type:
 *                   type: string
 *                 address:
 *                   type: string
 *                 contact_number:
 *                   type: string
 *                 contact_email:
 *                   type: string
 *                 updated_by:
 *                   type: number
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the owner
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/business/{business_uuid}:
 *   delete:
 *     summary: Delete a business entry (Protected, only by owner)
 *     tags: [Business]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: business_uuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business deleted successfully
 *       400:
 *         description: Invalid UUID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the owner
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */