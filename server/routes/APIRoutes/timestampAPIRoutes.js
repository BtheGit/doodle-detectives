const express = require('express');
const router = express.Router();
const controller = require('../../controllers/timestampAPIController.js')

//URL = PATH + /api/timestamp/...

router.get('/', controller.index)
router.post('/*', controller.api)

module.exports = router;