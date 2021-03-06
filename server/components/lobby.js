const	{ gameSessionsMap, 
				lobbyUsers, 
				activePlayersMap
			} 														= require('../TEMPdb/db.js'),
			{ 
				generateSessionsList,
				generateLobbyUsersList
			} 														= require('./lobbyHelpers.js')

module.exports = lobby;

function lobby(io) {
	const lobbyIo = io.of('/lobby');
	lobbyIo.on('connection', (socket) => {
		console.log('Socket connection made:', socket.id)
		lobbyUsers.set(socket.request.user.id, socket.request.user.name)

		socket.on('reqUpdate', () => {
			const rooms = generateSessionsList(gameSessionsMap)
			const users = generateLobbyUsersList(lobbyUsers)
			socket.emit('getUpdate', {
				rooms,
				users
			})
		})

		socket.on('disconnect', () => {
			lobbyUsers.delete(socket.request.user.id)
		})
	})
	
	lobbyIo.on('error', (socket) => {
		console.log('Error in socket')
	})
}
