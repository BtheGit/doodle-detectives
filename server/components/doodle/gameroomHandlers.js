const {generateChatPacket, broadcastSession} = require('./socketHelpers');

const gameroomSocketHandlers = (socket, client, session, gameSessionsMap) => {

	//Handles typical client communications (chat/game)
	socket.on('packet', (packet) => {
		// console.log('Packet received: ', packet.type)
		if(packet) {
			if(packet.type === 'chat_message') {
				//Store message to log, generate packet for broadcast, then broadcast it
				session.addChatMessage(packet.payload)
				const newPacket = generateChatPacket(packet.payload);
				//Chat messages will be broadcast to everybody 
				//(client will only see own message on return from server for easy sync)
				client.send(newPacket); //send message back (could have two types of broadcast methods)
				client.broadcast(newPacket); //send to all other clients
			}
			else if(packet.type === 'path') {
				//TODO: create an array of paths for restore (and separate them by turn for voting?)

				client.broadcast(packet)
			}
			else if(packet.type === 'vote_to_begin') {
				session.addVoteToBegin(client);
			}
		}
	});

	socket.on('disconnect', () => {
		const session = client.session;
		if(session) {

			console.log('Client disconnected from session', session.id);
			session.leave(client);

			//Update clients when a player disconnects
			//Or terminate session altogether
			if(session.clients.size) {
				// broadcastSession(session); //Deprecated
				session.broadcastSessionState();
			} else {
				console.log(`Session ${session.id} removed`)
				gameSessionsMap.delete(session.id)				
			}
		}

	})
};

module.exports = gameroomSocketHandlers;