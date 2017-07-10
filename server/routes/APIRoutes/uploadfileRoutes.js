const express = require('express');
const router = express.Router();
const { catchErrors } = require('../../helpers/asyncErrorHandler');
const controller = require('../../controllers/uploadfileController.js')
const cors = require('cors')

//URL = PATH + /api/uploadfile/...
router.get('/', controller.uploadPage)
router.post('/', cors(), controller.upload, catchErrors(controller.uploadFile));


module.exports = router;