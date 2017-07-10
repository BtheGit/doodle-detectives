//(GENERIC - CAN REUSE IF OTHER GAMES)
//Converts relevant info from Map into an array of objects to be rendered on the menu screen as room choices.
//As of now this is only room id and active players. 
//TODO: add client names
exports.generateSessionsList = (map) => {
	let sessionsList = [];
	let rooms = [...map.entries()];
	rooms.forEach(([sessionId, session]) => {
		//Convert Set into Array to extract names
		let clients = Array.from([...session.clients]);
		clients = clients.map(client => client.name);
		sessionsList.push({sessionId, clients})

	})
	return sessionsList;
}
