const express = require('express');
const router = express.Router();
const { catchErrors } = require('../helpers/asyncErrorHandler');
const controller = require('../controllers/doodleController.js') //Handling user-related pages
const authController = require('../controllers/authController.js') //Handling user-related pages

//URL = PATH + /doodle/...

//USER/AUTH ROUTES
router.get('/lobby', authController.isLoggedIn, controller.connectLobby, controller.lobby);
router.get('/room/:id', authController.isLoggedIn, controller.room);
router.get('/room', authController.isLoggedIn, controller.room);

module.exports = router;