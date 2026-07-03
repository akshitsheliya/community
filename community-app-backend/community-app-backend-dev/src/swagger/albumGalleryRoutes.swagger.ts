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
*         example: "gu_IN"
*       required: false
* 
* paths:
*   /api/albums:
*     post:
*       summary: Create a new photo album (Protected)
*       tags: [Gallery]
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
*                 photo_album_name:
*                   type: string
*                   description: Name of the photo album.
*                   example: "Snehmilan"
*                 photo_album_year:
*                   type: integer
*                   description: The year of the photo album.
*                   example: 2024
*       responses:
*         201:
*           description: Photo album created successfully
*         400:
*           description: Bad request - Invalid input
*         401:
*           description: Unauthorized - Missing or invalid token
*         500:
*           description: Internal server error
* 
*     get:
*       summary: Get all photo albums sorted by newest first (Protected)
*       tags: [Gallery]
*       security:
*         - BearerAuth: []
*       parameters:
*         - $ref: '#/components/parameters/AcceptLanguage'
*       responses:
*         200:
*           description: Successful retrieval of photo albums
*           content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   success:
*                     type: boolean
*                     example: true
*                   message:
*                     type: string
*                     example: "album_fetch_success"
*                   data:
*                     type: array
*                     items:
*                       type: object
*                       properties:
*                         photo_album_id:
*                           type: integer
*                           example: 1
*                         photo_album_name:
*                           type: string
*                           example: "Snehmilan"
*                         photo_album_year:
*                           type: integer
*                           example: 2024
*                         added_on:
*                           type: string
*                           format: date-time
*                           example: "2025-03-11T12:30:00Z"
*                         added_by:
*                           type: string
*                           example: "user-uuid-123"
*         404:
*           description: No photo albums found
*         400:
*           description: Bad request - Invalid input
*         401:
*           description: Unauthorized - Missing or invalid token
*         500:
*           description: Internal server error
* 
*   /api/albums/{album_uuid}:
*     delete:
*       summary: Delete an album and its contents
*       tags: [Gallery]
*       security:
*         - BearerAuth: []
*       parameters:
*         - $ref: '#/components/parameters/AcceptLanguage'
*         - in: path
*           name: album_uuid
*           required: true
*           schema:
*             type: string
*           description: ID of the album to delete
*       responses:
*         200:
*           description: Album deleted successfully
*         400:
*           description: Invalid album ID
*         401:
*           description: Unauthorized
*         403:
*           description: Admin access required
*         404:
*           description: Album not found
*         500:
*           description: Internal server error
* 
*     put:
*       summary: Update an existing photo album (Protected)
*       tags: [Gallery]
*       security:
*         - BearerAuth: []
*       parameters:
*         - $ref: '#/components/parameters/AcceptLanguage'
*         - in: path
*           name: album_uuid
*           required: true
*           schema:
*             type: string
*           description: ID of the album to update
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 photo_album_name:
*                   type: string
*                   description: Updated name of the photo album.
*                   example: "Updated Snehmilan"
*                 photo_album_year:
*                   type: integer
*                   description: Updated year of the photo album.
*                   example: 2025
*       responses:
*         200:
*           description: Photo album updated successfully
*         400:
*           description: Bad request - Invalid input
*         401:
*           description: Unauthorized - Missing or invalid token
*         404:
*           description: Album not found
*         500:
*           description: Internal server error
*/