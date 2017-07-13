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

class Game {
	constructor(session, players) {
		//Give us access to session socket handlers for broadcasting
		this.session = session; 
		//NB: For the current implementation, the players cannot change after this point.
		//Players leaving or not participating will wreck the game.
		//Game variables
		this.state = {
			isGameDisplayingSecret: true,
			isDrawingPhase: false,
			isVotingForFake: false,
			isVotingForGuess: false,
			isGameOver: false,
			playerList: [],
			activePlayer: [],
			currentSecret: {
				category: '',
				secret: ''
			},
			turnList: null,
		}

		//Initialize Game
		console.log('Setting up new game')
		this._setupNewGame(players);
		console.log('Displaying Secret')
		this._displaySecret(this.state.currentSecret)
		console.log('Starting turn progression')
		setTimeout(() => this._nextTurn([...this.state.turnList]), 5000)
		console.log('Turns finished')
		// setTimeout(this._gameLoop, 5000) //For now nextturn, can put all logic in generator gameloop later or await/async
		//setTimeoutfor5seconds to begin first turn
		//at the end of each turn is an if statement
		//---if not last turn settimeout for next turn
		//---else settimeout for voting phase 1
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

	_setPlayerColors(players, colors) {
		//Duplicate array of colors. Shuffle it
		//Map through array of players, for each player, pop off the last color and add it to the player		
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
		// playerTurns = playerTurns.map(player => {

		// });
		return playerTurns;
	}

	//Select random secret from array of objects with category and secret
	//Add secret to list of used secrets
	//TODO: if secret is already used, generate a different one
	_generateSecret(secrets) {
		return secrets[Math.floor(Math.random() * secrets.length)];
	}

	_setupNewGame(players) {
		players = this._setFakePlayer(players);
		players = this._setPlayerColors(players, COLORS);
		players = this._setPlayerTurnOrder(players);
		this.state.playerList = players;
		this.state.turnList = this._createTurnList(players);
		this.state.currentSecret = this._generateSecret(SECRETS);

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

	_nextTurn(turns) {
		if(!turns) {
			return
		}
		else {
			//1)Do action
			console.log('Broadcasting turn')
			// this.broadcastTurn()
			//2) Shift off first (completed) turn
			console.log('Removing completed turn')
			turns.shift()
			console.log('Turns remaining: ', turns.length)
			//3) Call nextTurn with remaining turns on a timeout
			setTimeout((turns) => this._nextTurn(turns), 5000)
		}
	}

	_gameLoop() {
		while(this.state.turnList.length) {
			const turn = this.state.turnList.shift()
			this._nextTurn(turn)
			//wait 30 seconds
		}
		this._detectingVote()
		//wait for votes
		//tally votes 
		//---ties = automatic win for fake 
		// if(voteWinner !== fake || vote is a tie) -> go to gameover state and wait for restart


	}

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
