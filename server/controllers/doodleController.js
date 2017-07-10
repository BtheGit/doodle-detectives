const passport 																= require('passport'),
			path 																		= require('path'),
			mongoose 																= require('mongoose'),
			User 																		= mongoose.model('User'),
			promisify 															= require('es6-promisify'),
			{ gameSessionsMap, lobbyUsers } 				= require('../TEMPdb/db.js'),
			{ generateSessionsList } 								= require('./doodle/lobbyHelpers')		

//######## ROUTES

exports.lobby = (req, res) => {
	res.render('./doodle/lobby')
}

exports.room = (req, res) => {
	res.sendFile(path.join(__dirname + '/../public/cra-doodle/index.html'))
	// res.render('./doodle/room')
}

//############ LOBBY HELPERS 
exports.connectLobby =(req,res,next) => {
	//TODO:
	//The idea is to have a list of active users
	//And to have a chat window
	req.io.of('/lobby').on('connection', (socket) => {
		console.log('Socket connection made:', socket.id)
		lobbyUsers.set(req.user._id, req.user.name)
		console.log(lobbyUsers)

		socket.on('reqUpdate', () => {
			const rooms = generateSessionsList(gameSessionsMap)
			socket.emit('getUpdate', rooms)
		})

		socket.on('disconnect', () => {
			lobbyUsers.delete(req.user._id)
			console.log(lobbyUsers)
			})
	})
	next()
}


