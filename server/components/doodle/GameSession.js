const Game = require('./Game');

//TODO: Track Room Players current scores, persist them after each game
//TODO: Convert string constants to actual constants

//This class will contain the logic for each game session (initiated by first player entering room, terminated
//by last player exiting room)
//Each time a new game is initiated a Game instance will be created
//Any tracking of state between games should be done at this level or higher

const MINIMUM_PLAYERS_FOR_GAME = 2;

//Session State Toggles
const GAMEACTIVE        = 'GAMEACTIVE',
      WAITINGTOSTART    = 'WAITINGTOSTART',
      WAITINGFORPLAYERS = 'WAITINGFORPLAYERS';

class GameSession {
	constructor(id) {
		this.id = id;
		this.clients = new Set;
		this.votedToBegin = new Set;
		this.votedToReset = new Set;
		this.chatLog = [];
		this.paths = [];
		this.currentSessionStatus = WAITINGFORPLAYERS;
		this.game = null;
		// this.usedSecrets = [] //figure out the best way to track variables like secrets/scores between games
	}

	//CHAT LOG
	addChatMessage(msg) {
		this.chatLog = [...this.chatLog, msg];
	}

	getChatLog() {
		return this.chatLog || [];
	}

	//DRAWING PATHS
	addPath(path) {
		this.paths = [...this.paths, path]
	}

	getPaths(){
		return this.paths || [];
	}

	clearPaths(){
		this.paths = [];
	}

	//############# VOTES TO BEGIN
	addVoteToBegin(client) {
		this.votedToBegin.add(client)
		this.broadcastSystemMessage(`${client.name.toUpperCase()} voted to start a new game.`)
		this._updateVoteToBeginStatus();
	}

	removeVoteToBegin(client) {
		this.votedToBegin.delete(client);
		this._updateVoteToBeginStatus();
	}

	//GAME Will initialize here when all votes have been collected.
	_updateVoteToBeginStatus() {
		if(this.currentSessionStatus !== GAMEACTIVE){
			if(this.clients.size === this.votedToBegin.size) { 
				this.currentSessionStatus = WAITINGTOSTART; //TODO: Is this redundant?
				this.initGame();
			}
			else {
				this.currentSessionStatus = WAITINGFORPLAYERS;
			}
		}
	}

	//############# HARD RESET LOGIC
	
	/**
	 * Players are able to vote to reset at any time. There are checks clientside to prevent sending the vote when
	 * a game is not active. This is a secondary security measure. Votes will act as a toggle, allowing players
	 * to cancel their vote with impunity. 
	 * @param {Object} client 
	 */
	addVoteToReset(client) {
		if(this.currentSessionStatus === GAMEACTIVE){
			if(!this.votedToReset.has(client)) {
				this.votedToReset.add(client);
				this.broadcastSystemMessage(`${client.name.toUpperCase()} voted to reset the game.`)	;	
				this._updateVoteToResetStatus();
			}
			else {
				this.removeVoteToReset(client);
			}
		}
	}

	removeVoteToReset(client) {
		this.votedToReset.delete(client);
		this.broadcastSystemMessage(`${client.name.toUpperCase()} cancelled their vote to reset.`);
		this._updateVoteToResetStatus();
	}

	/**
	 * If at least half the clients in the room are currently voting to end the game, a reset will be triggered
	 * 
	 */
	_updateVoteToResetStatus() {
		if(this.votedToReset.size >= Math.ceil(this.clients.size / 2)) {
			this.broadcastSystemMessage('--Game cancelled by player vote--');
			this.resetSessionStatusAfterGame();
			this.broadcastHardReset();
		}
	}

	/**
	 * Takes Fake Vote from socket handler and passes it to Game handler
	 * @param {Object} vote [contains client id and vote (color)]
	 */
	addVoteForFake(vote) {
		this.game.addVoteForFake(vote)
	}

	receiveVoteToApproveGuess(client, vote) {
		this.game.addVoteToApproveGuess(client, vote)
	}

	broadcastHardReset() {
		const clients = [...this.clients] || [];
		clients.forEach(client => {
			if(client.socket && client.socket.connected) {
				client.send({
					type: 'hard_reset'
				})
			}
		})				
	}

	broadcastSystemMessage(message) {
		const clients = [...this.clients] || [];
		clients.forEach(client => {
			if(client.socket && client.socket.connected) {
				client.send({
					type: 'chat_message',
					payload: {
						time: Date.now(),
						content: message
					}
				})
			}
		})			
	}

	broadcastSessionState() {
		const clients = [...this.clients] || []; //To avoid server crash if there are no clients

		//FILTER DATA We only want to have a list available. More specific player info, like color, is handled in the gameState
		const players = clients.map(client => {
			return {
				id: client.id,
				name: client.name,
			}
		});

		const sessionState = {
			players,
			currentSessionStatus: this.currentSessionStatus
		}

		clients.forEach(client => {
			if(client.socket && client.socket.connected) {
				client.send({
					type: 'session_state_update',
					sessionState
				})
			}
		})			
	}

	_emitGameWillStartAlert() {
		const clients = [...this.clients] || []; 
		clients.forEach( client => {
			client.send({
				type: 'game_will_start'
			})
		})	
	}

	//TODO: make sure a maximum of 8 can join room
	join(client) {
		if(client.session) {
			throw new Error ('Client already in session')
		}
		this.clients.add(client);
		client.session = this;
		this._checkPlayerQuotas()
	}

	leave(client) {
		if(client.session !== this) {
			throw new Error('Client not in session');
		}
		//If they have already voted to start game we want to remove that vote
		if(this.votedToBegin.has(client)) {
			this.removeVoteToBegin(client);
		}

		if(this.votedToReset.has(client)) {
			this.removeVoteToReset(client);
		}

		this.clients.delete(client);
		client.session = null;
		this._checkPlayerQuotas();
	}

	//This is triggered in _updateVoteToBeginStatus() when all votes have been collected
	initGame() {
		this.clearPaths();
		this._emitGameWillStartAlert(); 
		this.currentSessionStatus = GAMEACTIVE;
		//Create a copy of players for the game to manipulate without affecting session members
		const players = this._createPlayerList();
		//Games will not be recycled. Each game will be a new instance.
		this.game = new Game(this, players)
		this.broadcastSessionState();
	}

	/**
	 * This function will direct the active game to advance to the next turn. It's
	 * primary function is to ensure that the command to advance comes from the currently
	 * active player, to avoid cheating.
	 * @param  {Object} client [Gives us access to the id of the active player] 
	 */
	nextTurn(client, turnId) {
		console.log('next turn request', client.id) //For testing REMOVE
		const curTurn = this.game.retrieveState().currentTurn
		if(curTurn.id === client.id && curTurn.turnId === turnId) {
			this.game.nextTurn()
		}
	}

	receiveFakeGuess(guess) {
		this.game.receiveFakeGuess(guess);
	}

	resetSessionStatusAfterGame() {
		this.votedToReset = new Set;
		this.votedToBegin = new Set;
		this.currentSessionStatus = WAITINGTOSTART;
		this._checkPlayerQuotas();
		this.broadcastSessionState();
	}

	//This will be the player list that the Game instance manipulates and broadcasts to. 
	//Passing a copy will allow us to mutate it at will for the duration of the game and
	//reset for the next game without consequence
	_createPlayerList() {
		let players = Array.from(this.clients);
		players = players.map(player => {
			return {
				id: player.id,
				name: player.name,
				socket: player.socket,
				color: '',
				isFake: false,
			}
		})
		return players;
	}

	_checkPlayerQuotas() {
		if(this.currentSessionStatus !== GAMEACTIVE) {
			if(this.clients.size >= MINIMUM_PLAYERS_FOR_GAME) {
				this.currentSessionStatus = WAITINGTOSTART;
			}	
			else {
				this.currentSessionStatus = WAITINGFORPLAYERS;
			}
		}
	}
}

module.exports = GameSession;