const express = require('express');
const router = express.Router({ mergeParams: true });
const botController = require('../../controllers/Bots/index')


router.post('/interact', botController.interact)
router.post('/initiate', botController.initiate)
router.get('/seed', botController.seedData)

module.exports = router