const mongoose = require('mongoose');
const validator = require('validator');
const URL_Abbr = mongoose.model('URL_Abbr');
var shortid = require('shortid'); //For hashing

//#### HELPERS
const genId = async () => {
	const id = shortid.generate()
	//Recursive to make sure shortened Id does not already exist. (Hopefully 'await' works like this!)
	const uniqueId = await URL_Abbr.findOne({abbrURL: id}) ? genId() : id;
	//Was getting stack overflow returning ternary with await. This seems to be fine though. 
	return uniqueId;
}

//#### CONTROLLERS
exports.redirect = async (req, res) => {
	//Grab shortened URL
	const abbrURL = req.params['0'] || null;
	if (abbrURL !== null) {
		//Look up in Database for match return full length url
		const existingRecord = await URL_Abbr.findOne({abbrURL}, (err, record) => !err ? record : null)
		if(existingRecord) {
			//If match, redirect to full url
			//Because of iFrame, not sure if this works for google/facebook.
			res.redirect(existingRecord.fullURL)
		}
		else {
			res.json({error: 'No such URL exists. Cannot redirect to invalid URL.'})
		}
	} 
	else {
		res.json({error: 'No URL provided. Cannot redirect to empty URL.'})
	}
}


exports.abbr = async (req, res) => {
	//Grab URL
	const fullURL = req.params['0'] || null;
	if(!fullURL) {
		//No URL Provided
		res.json({error: 'No URL provided. Cannot abbreviate empty URL.'})
	}
	else {
		if(!validator.isURL(fullURL)) {
			res.json({error: 'Not valid URL, cannot abbreviate.'})
		}
		else {
			//Check if URL is already in database
			const record = await URL_Abbr.findOne({fullURL}, (err, record) => !err ? record : null)
			if(record) {
				//Return pre-existing shortened URL
				res.json({
					'original_url': record.fullURL,
					'short_url': record.abbrURL
				})
			}
			else {
				//hash url with shortid library (wrapped in my own helper function to avoid collisions)
				const abbrURL = await genId();

				//Store new url record
				const newRecord = new URL_Abbr({
					abbrURL,
					fullURL
				});
				await newRecord.save((err, record) => { 
					if(err)	{
						res.json(err);
					}
					else {
						res.json({
							'original_url': record.fullURL,
							'short_url': record.abbrURL
						})
					}
				});
			}
		}
	}
}

