const express = require('express');
const router = express.Router();
const { catchErrors } = require('../../helpers/asyncErrorHandler');
const controller = require('../../controllers/abbrURLController.js')

//URL = PATH + /api/abbrURL/...

//When a user posts a URL string, they will get a shortened link back, or error JSON
router.get('/new/*', catchErrors(controller.abbr))
//When a user tries to 'get' a valid shortened link we will redirect them / Else send an error
router.get('/*', catchErrors(controller.redirect))

module.exports = router;