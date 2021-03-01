const express = require('express');
const router = express.Router({ mergeParams: true });
const botController = require('../../controllers/Bots/index')


router.post('/interact', botController.interact)
router.post('/initiate', botController.initiate)

/**
 * @swagger
 * tags:
 *   name: BOT
 *   description: Bot  Routes
 */


  /**
* @swagger
* /bot/seed:
*   get:
*     summary:  Get All responses.
*     tags: [BOT]
*     description: This route get all Bot responses.
*     consumes:
*       — application/json
*     responses: 
*       200:
*         description: 
*       400:
*         description: Bad Request.
*/
router.get('/seed', botController.seedData)

module.exports = router