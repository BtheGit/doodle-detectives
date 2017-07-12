//(GENERIC - CAN REUSE IF OTHER GAMES)
//Converts relevant info from Map into an array of objects to be rendered on the menu screen as room choices.
//As of now this is only room id and active players. 
//TODO: add client names
exports.generateSessionsList = (map) => {
	const sessionsList = [];
	const rooms = [...map.entries()];
	rooms.forEach(([sessionId, session]) => {
		//Convert Set into Array to extract names
		let clients = Array.from([...session.clients]);
		clients = clients.map(client => client.name).join(',');
		const pop = session.clients.size;
		sessionsList.push({sessionId, clients, pop})
	})
	return sessionsList;
}

exports.parseMapForDB = (map) => {
	let parsed = [];
	let rooms = [...map.entries()];
	console.log(rooms)
	rooms.forEach(([key, value]) => {
		console.log(key, value)
		let clients = [...value.clients];
		const room = {
			'room': key,
			'pop': value.clients.size
		}
		parsed.push(room)

	})
	return parsed;
}