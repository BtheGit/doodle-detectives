class GameClient {
	constructor(socket = null, name, id, dbId) {
		this.socket = socket;
		this.name = name;
		this.id = id;
		this.dbId = dbId;
		this.color = '';
		this.session = null;
	}

	setColor(color) {
		this.color = color;
	};

	//Send a message to all clients except this one
	broadcast(packet) {

		if(!this.session) {
			throw new Error('No session to broadcast to!')
		}
		
		packet.clientName = this.name;
		packet.clientId = this.id;

		[...this.session.clients]
			.filter(client => client !== this)
			.forEach(client => client.send(packet))
	}

	//Send a message to just this client
	send(packet) {
		if(this.socket) {
			this.socket.emit('packet', packet)
		}
	}
}

module.exports = GameClient;