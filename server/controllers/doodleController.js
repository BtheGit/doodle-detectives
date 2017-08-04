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


exports.rules = (req, res) => {
	res.render('./doodle/rules')
}

//This is a hack to avoid the issue of improperly locating static resources because of 
//different url structure for existing rooms
exports.room = (req, res) => {
	if(!req.gameSession) {
		console.log('No gameSession detected, redirecting back to lobby')
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
	// if(gameSession.currentSessionStatus === 'isGameActive') {
	// 	//TODO: Flash 'Game already started. Can't join.'
	// 	next()
	// }
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
		//Don't let players join multiple sessions. Delete dangling session if it was just created and empty.
		if(activePlayersMap.has(req.user.id)) {
			res.redirect('/doodle/lobby')
			if(!req.gameSession.clients.size) {
				gameSessionsMap.delete(req.gameSession.id)
			}
		}
		else {
			//TODO Check it's current session id
			//TODO If it matches current url, don't change it (allowing for player reconnects)
			//TODO If it doesn't match, delete and create new client
			const randomID = new Date().valueOf() + generateRandomId(16)
			// The original idea of using the DB id was to be able to assist in reconnects. But until that is implemented
			// I think it's better to use a tempId that is safe to broadcast to other players (even though I've
			// already largely implemented the game working around that limitation, I will use it in color matching at least)
			client = new GameClient(null, req.user.name, randomID); //Socket will be setup on page load
			activePlayersMap.set(req.user.id, client)
			req.gameSession.join(client)
			next()	
		}
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

