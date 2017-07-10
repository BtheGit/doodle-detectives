const moment = require('moment');

//Helpers
const acceptableDateFormats = [moment.ISO_8601, "X"]; //'X' is moment's code for valid unix timestamps

//Middleware

//Routes
exports.index = (req, res) => {
	res.send('Timestamp API')
}

exports.api = (req, res) => {
	const timeStamp = req.params['0'] || moment() // moment() is similar to new Date() // ['0'] is the index for unspecified param (allow *)
	//Check for Valid Date
	if(moment(timeStamp, acceptableDateFormats, true).isValid()){ //'true' here creates stronger restrictions
		const time = {
			unix: moment(timeStamp, acceptableDateFormats).format("X"),
			utc: moment().utc(timeStamp).format()
		}
		res.json(time)	
	}
	else {
		res.json({error: "Invalid Date"})
	}
}