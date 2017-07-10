const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
mongoose.Promise = global.Promise; //to suppress terminal errors

const Schema = new mongoose.Schema({
	search: {
		type: String,
		required: 'No search terms to store'
	},
	time: {
		type: Date,
		required: 'No timestamp provided'
	}
})

//Modifies errors to make them more useful to us instead of mongodb error codes
Schema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('IMG_Search', Schema)