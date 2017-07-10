const mongoose = require('mongoose');
const IMG_Search = mongoose.model('IMG_Search');
const qs = require('querystring');
const fetch = require('node-fetch');


//######### ROUTES ##########

exports.search = async (req, res) => {
	const rawSearch = req.params[0] || '';
	if(!rawSearch.length) {
		//Could also have a random search term inserted instead!
		res.json({error: 'Search terms missing or invalid.'})
	}
	else {
		//Format search string for google API and add default opts (no customs for this)
		const searchReq = buildSearchReq(rawSearch);
		//Fetch google results
		const rawResults = await (await fetch(searchReq)).json()
		const resultsArray = formatSearchResults(rawResults.items);
		//store search string and current timestamp in database
		const newRecord = new IMG_Search({
			time: new Date(),
			search: rawSearch
		})
		await newRecord.save(err => {
			if(err) {
				//SOMETHING WENT HORRIBLY WRONG. WE'LL HAVE TO AMPUTATE!
			};
		})
		res.json(resultsArray)
	}
};

exports.recentSearches = async (req,res) => {
	//Return 10 most recent searches
	await IMG_Search.find({}).sort('-date').limit(10).exec((err, results) => {
		if(err) {
			res.json({error:"Couldn't retrieve results from Database."})
		}
		else {
			const resultsArray = formatLookupResults(results);
			res.json(results)
		}
	})
};

//######### HELPERS #########

//Build custom query string (using google-images library for reference)
function buildSearchReq(searchString) {
	const opts = {
		q: searchString.replace(/\s/g, '+'),
		searchType: 'image',
		cx: process.env.GOOGLE_CSE_ID,
		key: process.env.GOOGLE_API_KEY,
		num: 10
	}
	return `https://www.googleapis.com/customsearch/v1?${qs.stringify(opts)}`;
}

function formatSearchResults(rawResultsArray) {
	return rawResultsArray.map(el => ({
		title: el.title,
		img_url: el.link,
		img_contex: el.image.contextLink,
		thumbnail_url: el.image.thumbnailLink,
	}))
}

function formatLookupResults(rawResultsArray) {
	return rawResultsArray.map(el => ({
		search: el.search,
		time: el.time,
	}))	
}
