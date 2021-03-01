const express = require('express');
const router = express.Router({ mergeParams: true });
const apiController = require('../../controllers/Api/index')


router.get('/', apiController.getreponses)

module.exports = router