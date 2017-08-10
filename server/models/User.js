const mongoose 							= require('mongoose'),
			Schema								= mongoose.Schema,
			validator 						= require('validator'),
			mongodbErrorHandler 	= require('mongoose-mongodb-errors'),
			passportLocalMongoose = require('passport-local-mongoose')

mongoose.Promise 			= global.Promise //to suppress terminal errors

const user = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, 'Invalid Email Address'], //validate takes 2 args a) method of validation b) error
		required: 'Please supply an email address'
	},
	name: {
		type: String,
		required: 'Please supply a name',
		unique: true,
		trim: true
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date


	//NB: password is autogenerated and autohashed
});

user.plugin(passportLocalMongoose, {usernameField: 'email'}); //overrides using autogenerated username field for username
user.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', user);