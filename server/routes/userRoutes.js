const express = require('express');
const router = express.Router();
const { catchErrors } = require('../helpers/asyncErrorHandler');
const userController = require('../controllers/userController.js') //Handling user-related pages
const authController = require('../controllers/authController.js') //Handling auth-related middleware

//URL = PATH + /user/...

//USER/AUTH ROUTES
router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/register',
	//1) validate data
	userController.validateRegister,
	//2) register user
	catchErrors(userController.register),
	//3) login user
	authController.login
)

router.get('/profile', authController.isLoggedIn, userController.profile)

router.post('/profile', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));

router.get('/account/reset/:token',
	catchErrors(authController.verifyToken),
	userController.reset
);

router.post('/account/reset/:token', 
	authController.confirmedPasswords,
	catchErrors(authController.verifyToken),
	catchErrors(authController.update)
);


module.exports = router;