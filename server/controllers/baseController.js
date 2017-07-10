const passport 						= require('passport'),
			mongoose 						= require('mongoose'),
			User 								= mongoose.model('User'),
			promisify 					= require('es6-promisify')


exports.homePage = (req, res) => {
	res.render('index', {locals: {user: req.user, flashes: req.flash()}})
}

