const express = require('express');
const router = express.Router();
const { catchErrors } = require('../helpers/asyncErrorHandler');
const controller = require('../controllers/doodleController.js') //Handling user-related pages
const authController = require('../controllers/authController.js') //Handling user-related pages
const path = require('path')
//URL = PATH + /doodle/...

//USER/AUTH ROUTES
router.get('/lobby', 
	authController.isLoggedIn, 
	controller.lobby
);

//A parm was appended to the link URL that is the gameSession Id. 
//It is grabbed here and used to look up the session and allow the new client to join
router.get('/room/:id', 
	authController.isLoggedIn,
	controller.joinRoom, 
	controller.createClient, 
	controller.room
);

//Getting a vanilla room should simply create a new room.
router.get('/room', 
	authController.isLoggedIn, 
	controller.createRoom, 
	controller.createClient, 
	controller.room
);

//Attempting to workaround issues with express.static and CRA here.
//Not moving the logic for easier testing right now should move to controller later
router.get('/room/static/*', authController.isLoggedIn, (req, res) => {
	const route = req.params[0]
	res.sendFile(path.join(__dirname + '/../public/cra-doodle/static/' + route))
})

module.exports = router;