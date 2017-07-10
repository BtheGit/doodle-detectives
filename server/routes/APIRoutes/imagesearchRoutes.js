const express = require('express');
const router = express.Router();
const { catchErrors } = require('../../helpers/asyncErrorHandler');
const controller = require('../../controllers/imagesearchController.js')

//URL = PATH + /api/imagesearch/...

router.get('/search/*', catchErrors(controller.search));
router.get('/latest', catchErrors(controller.recentSearches));

module.exports = router;