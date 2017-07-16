const	{ gameSessionsMap, lobbyUsers, activePlayersMap } = require('../../TEMPdb/db.js'),
			{ generateChatPacket, broadcastSession } 					= require('./socketHelpers'),
			gameroomSocketHandlers 														= require('./gameroomHandlers'),
			{ generateRandomColor, generateRandomId } 				= require('./gameroomHelpers'),
			GameClient 																				= require('./GameClient'),
			GameSession 																			= require('./GameSession');

module.exports = doodle;
//################################################
//############ GAMEROOM LOGIC ####################

//TODO: Wait for players
//TODO: Setup game (assign order and colors)
//TODO: Main game loop (stepping through array of turns)
function doodle(io) {
	const gameroom = io.of('/gameroom');
	gameroom.on('connection', (socket) => {
		let client = activePlayersMap.get(socket.request.user.id);
		if(client) {
			console.log('Gameroom connection detected:', socket.id, socket.request.user.name)
			
			//Socket will wait for client information before creating client and (joining it to/creating) a game session
			//gameroomSocketHandlers will be added which are the main conduit of communicating between clients in a session
			//gameroomSocketHandlers also contains the disconnect logic for the socket
			socket.on('setup_client', (packet) => {
				//We need to append the new socket to the existing client to allow 
				//communication during game
				// client = activePlayersMap.get(socket.request.user.id)
				client.socket = socket
				session = client.session
				client.send({
					type: 'setup_client',
					payload: {
					  sessionId: session.id,
					  clientId: client.id,
					  clientName: client.name,
					  color: generateRandomColor(),
					  chatLog: session.getChatLog()
					}
				});
				//Initialize session state
				session.broadcastSessionState();
				//Initiate Packet Handlers
				gameroomSocketHandlers(socket, client, session, gameSessionsMap);
			})
		}
	})
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
