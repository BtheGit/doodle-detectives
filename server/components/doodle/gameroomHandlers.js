const {generateChatPacket, broadcastSession} = require('./socketHelpers');

const gameroomSocketHandlers = (socket, client, session, gameSessionsMap) => {

	//Handles typical client communications (chat/game)
	socket.on('packet', (packet) => {
		if(packet) {
			if(packet.type === 'chat_message') {
				session.addChatMessage(packet.payload)
				const newPacket = generateChatPacket(packet.payload);
				//Chat messages will be broadcast to everybody 
				//(client will only see own message on return from server for easy sync)
				client.send(newPacket); //send message back (could have two types of broadcast methods instead)
				client.broadcast(newPacket); //send to all other clients
			}
			else if(packet.type === 'path') {
				//TODO: create an array of paths for restore (and separate them by turn for voting?)
				client.broadcast(packet)
			}
			else if(packet.type === 'vote_to_begin') {
				session.addVoteToBegin(client);
			}
			else if(packet.type === 'end_of_turn') {
				session.nextTurn(client)
			}
			else if(packet.type === 'vote_for_fake') {
				console.log('Vote for fake received')
				const vote = {
					id: client.id,
					vote: packet.vote
				}
				session.addVoteForFake(vote)
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