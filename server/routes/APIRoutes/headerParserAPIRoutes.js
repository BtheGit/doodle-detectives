const express = require('express');
const router = express.Router();
const controller = require('../../controllers/headerParserAPIController.js')

//URL = PATH + /api/timestamp/...

router.get('*', controller.api)

module.exports = router;