const mongoose 		= require('mongoose'),
			User 				= mongoose.model('User'),
			path 				= require('path'),
			promisify		= require('es6-promisify')

exports.loginForm = (req, res) => {
	res.render('./user/login')
}

exports.registerForm = (req, res) => {
	res.render('./user/register')
}

exports.profile = (req, res) => {
	res.render('./user/profile')
}

exports.rules = (req, res) => {
	res.render('./user/rules')
}

exports.reset = (req, res) => {
	//Show the reset form (after token is verified)
	res.render('./user/reset')
}

exports.validateRegister = (req, res, next) => {
	//Using express-validator library on top of validator.js to validate and normalize registration data

	req.sanitizeBody('name'); // Making sure no malicious scripts are included
	req.checkBody('name', 'You must supply a name').notEmpty();
	req.checkBody('email', 'That email is not valid!').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', "Password can't be blank!").notEmpty();
	req.checkBody('password-confirm', 'Please confirm password!').notEmpty();
	req.checkBody('password-confirm', 'Passwords do not match').equals(req.body.password);
	
	//Handle all errors
	const errors = req.validationErrors();
	if(errors) {
		//errors will be handled instead of passed to middleware
		req.flash('error', errors.map(err => err.msg));
		res.redirect('/');
		// res.render('./user/register', {locals: {body: req.body, flashes: req.flash()}});
		return;
	}

	next();
};

exports.register = async (req, res, next) => {
	const user = new User({email: req.body.email, name: req.body.name});
	//passport-local-mongoose .register doesn't return a promise, uses a callback so can't await
	//we can use promisify to achieve that isntead
	//need to pass a) the method to promisify b) because the object is on a method, the parent method itself
	const register = promisify(User.register, User);

	//this will store hash of password
	await register(user, req.body.password);

	next() //pass to authcontroller
};

exports.updateAccount = async (req, res) => {
	const updates = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findOneAndUpdate(
		//query for user
		{ _id: req.user._id},
		//update data ($set =overwrite)
		{ $set: updates },
		//options (context required)
		{new: true, runValidators: true, context: 'query'}
	);
	req.flash('success', 'Profile Updated')
	res.redirect('back');
}