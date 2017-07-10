const useragent = require('express-useragent');
//Helpers

//Middleware

//Routes
exports.api = (req, res) => {
	const ua = useragent.parse(req.headers['user-agent'])
	res.json({
		ip: req.ip,
		language: req.acceptsLanguages()[0],
		os: ua.os
	})
}