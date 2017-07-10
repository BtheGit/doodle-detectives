const	{ gameSessionsMap, lobbyUsers } 				= require('../../TEMPdb/db.js');
const { generateChatPacket, broadcastSession } = require('./socketHelpers');
const gameroomSocketHandlers = require('./gameroomHandlers');
const { generateRandomColor, generateRandomId } = require('./gameroomHelpers');
const GameClient = require('./GameClient');
const GameSession = require('./GameSession');

module.exports = doodle;
//################################################
//############ GAMEROOM LOGIC ####################

//TODO: Wait for players
//TODO: Setup game (assign order and colors)
//TODO: Main game loop (stepping through array of turns)
function doodle(io) {
	const gameroom = io.of('/gameroom');
	gameroom.on('connection', (socket) => {
		let client;

		console.log('Gameroom connection detected:', socket.id, socket.request.user.name)
		
		//Socket will wait for client information before creating client and (joining it to/creating) a game session
		//gameroomSocketHandlers will be added which are the main conduit of communicating between clients in a session
		//gameroomSocketHandlers also contains the disconnect logic for the socket
		socket.on('setup_client', (packet) => {
			client = new GameClient(socket, socket.request.user.name, generateRandomId());
			client.send({type: 'temp_get_myid', id: client.id})
			console.log('Client created', client.name)
			if(!packet.sessionId) {
				console.log('Creating Game Session')

				const session = createGameSession(generateRandomId()); //could also just use socket id?
				session.join(client);

				client.send({
					type: 'setup_client',
					payload: {
					  id: session.id,
					  color: generateRandomColor(),
					  chatLog: session.getChatLog()
					}
				});
				//Initialize session state
				session.broadcastSessionState();
				//Initiate Packet Handlers
				gameroomSocketHandlers(socket, client, session, gameSessionsMap);
			}
			else  {
				const session = gameSessionsMap.get(packet.sessionId) || createGameSession(packet.sessionId);
				session.join(client);

				console.log(client.name, 'joined game session', session.id)

				client.send({
					type: 'setup_session',
					payload: {
					  id: session.id,
					  color: generateRandomColor(),
					  chatLog: session.getChatLog()
					}
				});
				//Update clients with new player joined to session
				session.broadcastSessionState();
				// broadcastSession(session);
				//Initiate Packet Handlers
				gameroomSocketHandlers(socket, client, session, gameSessionsMap);
				// session.initGame();
			}	
		})
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
