const passport 						= require('passport'),
			mongoose 						= require('mongoose'),
			User 								= mongoose.model('User'),
			promisify 					= require('es6-promisify'),
			crypto 							= require('crypto'),
			mail 								= require('../helpers/mailHelpers.js')


//MIDDLEWARE
exports.isLoggedIn = (req, res, next) => {
	//check if user is authenticated and pass to next middleware
	if(req.isAuthenticated()) return next();
	//Flash failure and return to login
	req.flash('error', 'Oops you must be logged in to do that!');
	res.redirect('/user/login');
}

exports.confirmedPasswords = (req, res, next) => {
	//verify that password and confirm password entered by user match
	if(req.body.password === req.body['password-confirm']) return next();
	//Otherwise send them back to try again
	req.flash('error', "Passwords don't match!");
	res.redirect('back');
}

exports.verifyToken = async (req, res, next) => {
	//Lookup user by resetToken and by expiryDate - using $gt (greater than) it only returns a success if the 
	//expiryDate is greater than the current time (ie not expired)
	req.user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if(req.user) {
		return next();
	}
	//If no user found (which could just mean token is expired)
	req.flash('error', 'Password reset is invalid or expired');
	//TODO redirect to get reset token route
	res.redirect('/user/login');
}

//ROUTES
exports.login = passport.authenticate('local', {
	failureRedirect: '/user/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'Logged in.'
})

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out.')
	res.redirect('/');
};

//EMAIL RESET FLOW

exports.forgot =  async (req, res) => {
	//1) Verify user exists with provided email
	const user = await User.findOne({ email: req.body.email });
	//No match:
	if(!user) {
		req.flash('error', 'Email address not found');
		res.redirect('/user/login');
	}

	//Create and set reset token and expiry time on DB account (1 hr)
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();

	//3)Send email with token
	const resetURL = `http://${req.headers.host}/user/account/reset/${user.resetPasswordToken}`; //req.headers.host = current domain
	await mail.send({
		user,
		subject: 'Password reset',
		resetURL,
		filename: 'password-reset'
	})
	req.flash('success', `You have been emailed a password reset link.`);
	//4) Redirect to login
	res.redirect('/user/login')
}

exports.update = async (req, res) => {
	//After new password is confirmed to match and resest token is verified to still be active
	//user was added to req by middleware verifyToken
	const user = req.user;
	//setpassword uses callbacks, no promises. let's fix that
	//promisify takes old function and creates new one then binds it to obj pased in 2nd arg
	const setPassword = promisify(user.setPassword, user);
	//setting fields to undefined in mongo will erase them
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	//need to keep a copy of the updated user to use for passport login middleware
	const updatedUser = await user.save()
	await req.login(updatedUser);
	req.flash('success', 'Your password has been changed.');
	req.flash('success', 'Logged in.');
	res.redirect('/');
}
