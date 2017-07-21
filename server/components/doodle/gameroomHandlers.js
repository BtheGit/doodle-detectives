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
				session.addPath(packet.payload);
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
			else if (packet.type === 'fake_guess') {
				//We want to send this guess out for approval (to allow for creative license in answering rather than strict
				//syntax matching)
				session.receiveFakeGuess(packet.guess)
			}
			else if (packet.type === 'guess_approval_vote') {
				console.log('Received vote to approve guess of ', packet.vote)
				session.receiveVoteToApproveGuess(client.id, packet.vote)
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
				session.broadcastSessionState();
			} else {
				console.log(`Session ${session.id} removed`)
				gameSessionsMap.delete(session.id)				
			}
		}

	})
};

module.exports = gameroomSocketHandlers;