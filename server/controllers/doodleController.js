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
	if(req.gameSession) {
		res.sendFile('index.html', {root: './server/public/cra-doodle/'});
	}
	else {
		res.redirect('back');
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
	if(gameSession.clients.size < gameSession.MAX_ROOM_OCCUPANCY) {
		req.gameSession = gameSession
	}
	//TODO: Else add flash indicating room full
	
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
		const clientIdIndex = req.gameSession.returnClientsIds().indexOf(req.user.id);
		if(clientIdIndex !== -1) {
			const userInMap = activePlayersMap.get(req.user.id)
			console.log(userInMap)
			if(!userInMap.socket || !userInMap.socket.connected || !userInMap.session) {
				//Connected client is actually a phantom not attached to a session
				//Let's help him shuffle off this mortal coil
				activePlayersMap.delete(req.user.id);
				req.gameSession.deleteClient(req.user.id);
				setupNewClient(req.user.name, req.user.id, req.gameSession, activePlayersMap);
				next();
			} 
			else {
				if(!req.gameSession.clients.size) {
					gameSessionsMap.delete(req.gameSession.id);
				}
				res.redirect('/doodle/lobby');
			}
		}
		else {
			setupNewClient(req.user.name, req.user.id, req.gameSession, activePlayersMap);
			next();
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

function setupNewClient(name, id, session) {
	//TODO Check it's current session id
	//TODO If it matches current url, don't change it (allowing for player reconnects)
	//TODO If it doesn't match, delete and create new client
	const randomID = new Date().valueOf() + generateRandomId(16)
	client = new GameClient(null, name, randomID, id); //Socket will be setup on page load
	activePlayersMap.set(id, client)
	session.join(client)
}

function purgePlayers() {
	//Iterate through all clients in sessions who don't have sockets disconnected/sessions and purge them
	//Create an array of all clients in all activesessions. 
	//Create an array of all clients in activeplayersmap
}