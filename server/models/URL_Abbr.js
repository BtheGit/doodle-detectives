const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
mongoose.Promise = global.Promise; //to suppress terminal errors

const Schema = new mongoose.Schema({
	abbrURL: {
		type: String,
		required: 'No short URL supplied',
		unique: true
	},
	fullURL: {
		type: String,
		required: 'No URL supplied',
		unique: true
	}
})

//Modifies errors to make them more useful to us instead of mongodb error codes
Schema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('URL_Abbr', Schema)