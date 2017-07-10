exports.generateChatPacket = payload => {
	return {
		type: 'chat_message',
		payload: {
			name: payload.name,
			time: payload.time,
			content: payload.content
		}
	};
};

//Used for broadcasting state updates to all clients in a given session
exports.broadcastSession = (session) => {
	if(session) {
		const clients = [...session.clients] || []; //To avoid server crash if there are no clients
		clients.forEach( client => {
			client.send({
				type: 'broadcast_session',
				clients: {
					//Allows clients to self-identify from list of all clients
					self: client.id,
					players: clients.map(client => {
						return {
							id: client.id,
							name: client.name,
							color: client.color
						}
					})
				}
			})
		})
	}
}