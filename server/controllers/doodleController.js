const passport 																					= require('passport'),
			path 																							= require('path'),
			mongoose 																					= require('mongoose'),
			User 																							= mongoose.model('User'),
			promisify 																				= require('es6-promisify'),
			{ gameSessionsMap, lobbyUsers, activePlayersMap } = require('../TEMPdb/db.js'),
			{ generateRandomColor, generateRandomId } 				= require('../components/doodle/gameroomHelpers'),
			GameSession 																			= require('../components/doodle/GameSession'),
			GameClient 																				= require('../components/doodle/GameClient')
		

//######## ROUTES

exports.lobby = (req, res) => {
	res.render('./doodle/lobby')
}

//This is a hack to avoid the issue of improperly locating static resources because of 
//different url structure for existing rooms
exports.room = (req, res) => {
	if(!req.gameSession) {
		res.redirect('/doodle/lobby')
	} 
	else {
		res.sendFile('index.html', {root: './server/public/cra-doodle/'})
	}
}

//############### ROOM MIDDLEWARE

//An empty gameSession will be created and added to DB of existing sessions, the session is passed along the 
//request and will have a client added to it by the next middleware
//When the page renders, passport.socketio will allow us to retrieve the client from the DB and retrieve the
//gameSession it is attached to. 
exports.createRoom = (req, res, next) => {
	const sessionId = new Date().valueOf() + generateRandomId()
	const gameSession = createGameSession(sessionId);
	req.gameSession = gameSession;
	console.log('GAME SESSION CREATED', req.gameSession)
	next();
}

//Join user to existing room based on url
//Check if room is full -> redirect to lobby with flash if so.
exports.joinRoom = (req, res, next) => {
	//Lookup gamesession by id
	const gameSession = gameSessionsMap.get(req.params.id)
	//If not found redirect to lobby with flash 'Not found'
	if(!gameSession) {
		//TODO set Flash message for room not found
		next()
	}
	//If game already in session, redirect to lobby with flash 'Game already started. Can't join.''
	if(gameSession.currentSessionStatus === 'isGameActive') {
		//TODO: Flash 'Game already started. Can't join.'
		next()
	}
	//TODO If full already redirect to lobby with flash 'Full'
	
	//Attach gameSessionto req
	req.gameSession = gameSession
	next();
}

//TODO!!
exports.createClient = (req,res, next) => {
	if(!req.gameSession){
		console.log('No client created')
		next()
	}
	else {
		//Lookup activePlayersMap for existing userID. 
		//Check it's current session id
		//If it matches current url, don't change it (allowing for player reconnects)
		//If it doesn't match, delete and create new client
		client = new GameClient(null, req.user.name, req.user.id); //Socket will be setup on page load
		//Add client to activePlayersMap
		activePlayersMap.set(req.user.id, client)
		//Add client to session
		req.gameSession.join(client)
		next()	
	}
}


//This should probably return the session that already exists instead of throwing an error?
function createGameSession(id) {
	if(gameSessionsMap.has(id)){
		throw new Error('Session already exists')
	}

	const session = new GameSession(id);
	gameSessionsMap.set(id, session);	
	
	return session;
}

