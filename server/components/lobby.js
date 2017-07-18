const	{ gameSessionsMap, lobbyUsers, activePlayersMap } = require('../TEMPdb/db.js'),
			{ generateSessionsList } 													= require('./lobbyHelpers.js')

module.exports = lobby;

function lobby(io) {
	io.of('/lobby').on('connection', (socket) => {
		console.log('Socket connection made:', socket.id)
		lobbyUsers.set(socket.request.user.id, socket.request.user.name)

		socket.on('reqUpdate', () => {
			const rooms = generateSessionsList(gameSessionsMap)
			socket.emit('getUpdate', rooms)
		})

		socket.on('disconnect', () => {
			lobbyUsers.delete(socket.request.user.id)
		})
	})
}
