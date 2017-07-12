const express = require('express');
const router = express.Router();
const { catchErrors } = require('../helpers/asyncErrorHandler');
const controller = require('../controllers/doodleController.js') //Handling user-related pages
const authController = require('../controllers/authController.js') //Handling user-related pages

//URL = PATH + /doodle/...

//USER/AUTH ROUTES
router.get('/lobby', authController.isLoggedIn, controller.connectLobby, controller.lobby);

//the url should have a hash (or param for post) that I can scrape here and use to initiate a room
router.get('/room/:id', authController.isLoggedIn, controller.room);



//Getting a vanilla room should simply create a new room.
router.get('/room', 
	authController.isLoggedIn, 
	controller.createRoom, 
	controller.createClient, 
	controller.room
);

module.exports = router;