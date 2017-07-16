const COLORS = [
	//Array of good colors (10)
	'yellow',
	'green',
	'blue',
	'red',
	'orange',
	'pink',
	'indigo',
	'violet',
	'brown',
	'teal'
]

const SECRETS = [
	{
		category: 'Animal',
		secret: 'Lion'
	},
	{
		category: 'Person',
		secret: 'Abraham Lincoln'
	},
	{
		category: 'Food',
		secret: 'Banana Split'
	},
	{
		category: 'Vehicle',
		secret: 'Helicopter'
	},
	{
		category: 'Halloween',
		secret: 'Headless Horseman'
	},
]

//Fischer-Yates Shuffle
const shuffleArray = (array) => {
  let i = array.length, 
  		j = 0,
    	temp;
  while(i) {
    j = Math.floor(Math.random() * i--);
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;	
  };
  return array;
}

//Game phase constants used in state updates to client to control flow
const DISPLAYSECRET = 'DISPLAYSECRET',
			DRAWING 			= 'DRAWING',
			FAKEVOTE 			= 'FAKEVOTE',
			GUESSVOTE 		= 'GUESSVOTE',
			GAMEOVER 			= 'GAMEOVER';

class Game {
	constructor(session, players) {
		//Give us access to session socket handlers for broadcasting
		this.session = session; 
		//NB: For the current implementation, the players cannot change after this point.
		//Players leaving or not participating will wreck the game.

		//Note to historians: Containing this in a state object was initially for the purposes of sending the
		//whole thing in search of El Dorado. WOuld have found it too if it weren't for you meddling kids.
		this.state = {
			currentPhase: '',
			playerList: [],
			activePlayer: [],
			secret: {
				category: '',
				secret: ''
			},
			turnList: null, //{id, name, socket, color, isFake}
			currentTurn: null
		}

		//Basic Setup
		this.state.playerList = this._setupPlayers(players);
		this.state.turnList = this._createTurnList(this.state.playerList);
		this.state.secret = this._generateSecret(SECRETS);

		//Initialize Game
		console.log('Starting main game sequence')
		this._start()
	}

	/**
	 * Generate a random fake artist for the round from array of players
	 * by adding additional isFake boolean property to player objects
	 * @param {Array} players  [array of players passed to the constructor]
	 * @return {Array} [players array with one player isFake set to true, the rest to false]
	 */
	_setFakePlayer(players) {
		const fake = players[Math.floor(Math.random() * players.length)]
		players = players.map(player => {
			const isFake = player.id === fake.id ? true : false;
			return Object.assign({}, player, {isFake})
		})
		return players;
	}

	//Duplicate array of colors. Shuffle it
	//Map through array of players, for each player, pop off the last color and add it to the player		
	_setPlayerColors(players, colors) {
		colors = shuffleArray([...colors])
		players = players.map(player => {
			const color = colors.pop();
			return Object.assign({}, player, {color})
		})
		return players;
	}

	_setPlayerTurnOrder(players) {
		return shuffleArray(players);
	}

	_createTurnList(players) {
		const playerTurns = [...players, ...players];
		return playerTurns;
	}

	//TODO: Add secret to list of used secrets
	//TODO: if secret is already used, generate a different one
	_generateSecret(secrets) {
		return secrets[Math.floor(Math.random() * secrets.length)];
	}

	_setupPlayers(players) {
		players = this._setFakePlayer(players);
		players = this._setPlayerColors(players, COLORS);
		players = this._setPlayerTurnOrder(players);
		return players
	}

	//Here I am manually accessing the sockets stored in the mutable playerList (instead of using a higher order
	//function passed from the gameSession) to emit the secret to all players except the fake who only receives
	//'xxx'. Client side handler will render based on that.
	_displaySecret(secret) {
		this.state.playerList.forEach( (player, index) => {
			const packet = {
				type: 'display_secret_phase',
				payload: {
					category: secret.category,
					secret: `${player.isFake ? 'XXX' : secret.secret}`
				}
			}
			player.socket.emit('packet', packet)
		});
	}

	_broadcastTurn(turn) {
		console.log(turn)
		this.state.playerList.map(player => {
			const packet = {
				type: 'next_turn',
				payload: {
					active: player.id === turn.id,
					color: turn.color
				}
			}
			console.log('Sending turn', packet.payload)
			player.socket.emit('packet', packet)
		})
	}


	_start() {
		console.log('Sending Secret')
		this._displaySecret(this.state.secret)
		console.log('Starting first turn')
		setTimeout(() => {this.nextTurn()}, 5000)
	}

	/**
	 * This function will initially be called by the server after an interval following the execution of the
	 * display secret phase. It will be subsequently triggered when received a message from the client of the
	 * current turn (indicating the end of the turn). 
	 * It will use the turn list generated at the instatiation of the game and be destructive. When the array
	 * is depleted (all turns completed). It will trigger the first voting phase.
	 * @param  {Array} Objects representing each turn (which player information)
	 */
	nextTurn() {
		const turns = this.state.turnList;
		if(!turns.length) {
			return
		}
		else {
			this.state.currentTurn = turns.shift();
			this._broadcastTurn(this.state.currentTurn)
		}
	}

	// 	this._detectingVote()
	// 	//wait for votes
	// 	//tally votes 
	// 	//---ties = automatic win for fake 
	// 	// if(voteWinner !== fake || vote is a tie) -> go to gameover state and wait for restart


	// }

	//Need to set up our own internal 

	//Loop through array of turns
			// iterate through turn array(
			// 	check if last turn
			// 	(if last turn, at end of turn start voting phase)
			// 	at the beginning of each turn -> broadcast turn state (who is drawing)
			// 	start timer for turn
			// 	receive and broadcast paths from player only (also client-side prohibit sending when not your turn) to other players

			// 	(LATER if player disconnects, start 60sec pause loop. If player returns before, resume, otherwise quit)
			// 	(LATER blackmark on player for disconnect, enough = flag/ban)
			// )

	retrieveState() {
		return this.state;
	}


}

module.exports = Game;
