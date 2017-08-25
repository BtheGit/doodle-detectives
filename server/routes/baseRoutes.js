const express = require('express');
const router = express.Router();
const { catchErrors } = require('../helpers/asyncErrorHandler');
// const baseController = require('../controllers/baseController.js')
const doodleController = require('../controllers/doodleController.js')
const authController = require('../controllers/authController.js')

// router.get('/', baseController.homePage)
router.get('/', authController.isLoggedIn, doodleController.lobby)

module.exports = router;