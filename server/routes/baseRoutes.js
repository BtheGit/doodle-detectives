const express = require('express');
const router = express.Router();
const { catchErrors } = require('../helpers/asyncErrorHandler');
const baseController = require('../controllers/baseController.js')

router.get('/', baseController.homePage)

module.exports = router;