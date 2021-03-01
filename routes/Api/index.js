const express = require('express');
const router = express.Router({ mergeParams: true });
const apiController = require('../../controllers/Api/index')

/**
 * @swagger
 * tags:
 *   name: Api
 *   description: Bot reponse Routes
 */


  /**
* @swagger
* /api:
*   get:
*     summary:  Get All responses.
*     tags: [Api]
*     description: This route get all Bot responses.
*     consumes:
*       — application/json
*     responses: 
*       200:
*         description: Receive back Responses   .
*       400:
*         description: Bad Request.
*/
router.get('/', apiController.getreponses)

module.exports = router