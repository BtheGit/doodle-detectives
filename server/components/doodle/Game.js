const SECRETS = require('../../TEMPdb/secretsDB.js'),
			COLORS = require('../../TEMPdb/colorsDB.js'),
			{ shuffleArray, generateRandomId } = require('./gameroomHelpers.js')




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
		
		this.state = {
			currentPhase: '',
			playerList: [],
			activePlayer: [],
			secret: {
				category: '',
				secret: ''
			},
			turnList: null, //{id, name, socket, color, isFake}
			currentTurn: null,
			currentTurnTimeout: null,
			fakeGuess: ''
		};
		this.fakePlayer = null;
		this.fakeVotes = new Set;
		this.votesToApprove = new Map;
		this.isFakeWinner = false;
		this.isFakeFound = false;

		//Basic Setup
		this.state.playerList = this._setupPlayers(players);
		this._updatePlayerColors(this.state.playerList);
		this.state.turnList = this._createTurnList(this.state.playerList);
		this.state.secret = this._generateSecret(SECRETS);

		//Initialize Game
		console.log('Starting Game');
		this._start();
	};

	/**
	 * Generate a random fake artist for the round from array of players
	 * by adding additional isFake boolean property to player objects
	 * @param {Array} players  [array of players passed to the constructor]
	 * @return {Array} [players array with one player isFake set to true, the rest to false]
	 */
	_setFakePlayer(players) {
		const fake = players[Math.floor(Math.random() * players.length)];
		this.fakePlayer = fake;
		players = players.map(player => {
			const isFake = player.id === fake.id ? true : false;
			return Object.assign({}, player, {isFake});
		});
		return players;
	};

	//Duplicate array of colors. Shuffle it
	//Map through array of players, for each player, pop off the last color and add it to the player		
	_setPlayerColors(players, colors) {
		colors = colors[`${players.length}`] //COLORS is an object of arrays depending on player count
		colors = shuffleArray([...colors]);
		players = players.map(player => {
			const color = colors.pop();
			return Object.assign({}, player, {color});
		});
		return players;
	};

	_setPlayerTurnOrder(players) {
		return shuffleArray(players);
	};

	_createTurnList(players) {
		let playerTurns = [...players, ...players];
		//Each turn will be given a unique Id that the server can use to override lapsed timers and avoid conflicts
		playerTurns = playerTurns.map(turn => {
			turn.turnId = generateRandomId(10)
			return turn
		})
		return playerTurns;
	};

	//TODO: Add secret to list of used secrets
	//TODO: if secret is already used, generate a different one
	_generateSecret(secrets) {
		return secrets[Math.floor(Math.random() * secrets.length)];
	};

	_setupPlayers(players) {
		players = this._setFakePlayer(players);
		players = this._setPlayerColors(players, COLORS);
		players = this._setPlayerTurnOrder(players);
		return players;
	};

	_start() {
		console.log('Sending Secret');
		this.state.currentPhase = DISPLAYSECRET;
		this._displaySecret(this.state.secret);
		console.log('Starting first turn');

		//Players have 10 seconds to prepare before the drawing phase starts
		setTimeout(() => {
			this.state.currentPhase = DRAWING;
			this.nextTurn()
		}, 10000);
	};

	//############ EMITTERS ###############
	//
	_updatePlayerColors(players) {
		const playerColors = {};
		players.forEach(player => {
			playerColors[player.id] = player.color;
		})
		const packet = {
			type: 'update_player_colors',
			playerColors
		};
		players.forEach(player => {
			player.socket.emit('packet', packet);
		});
	}

	//Here I am manually accessing the sockets stored in the mutable playerList (instead of using a higher order
	//function passed from the gameSession) to emit the secret to all players except the fake who only receives
	//'xxx'. Client side handler will render based on that.
	_displaySecret(secret) {
		this.state.playerList.forEach( (player, index) => {
			const packet = {
				type: 'display_secret_phase',
				payload: {
					secret: {
						category: secret.category,
						secret: `${player.isFake ? 'XXX' : secret.secret}`
					},
					fakeIsMe: player.isFake,
					displayLength: 10
				}
			};
			player.socket.emit('packet', packet)
		});
	};

	_broadcastTurn(turn) {
		this.state.playerList.map(player => {
			const isActive = player.id === turn.id;
			const packet = {
				type: 'next_turn',
				payload: {
					active: isActive,
					name: turn.name,
					id: turn.id,
					turnId: turn.turnId
				}
			};
			player.socket.emit('packet', packet);
		});
	};

	_initiateFakeVoteSequence() {
		console.log('Initiating Fake Vote Phase');
		this.state.currentPhase = FAKEVOTE;
		const players = this.state.playerList.map(player => player.color);
		const packet = {
			type: 'initiate_fake_vote',
			players
		};
		this.state.playerList.map(player => {
			player.socket.emit('packet', packet);
		});
	};

	_emitGameOverResults() {
		this.state.currentPhase = GAMEOVER;
		const players = this.state.playerList.map(player => {
			return {
				name: player.name,
				color: player.color,
				isFake: player.isFake
			};
		});

		const packet = {
			type: 'game_over',
			payload: {
				players,
				isFakeWinner: this.isFakeWinner,
				isFakeFound: this.isFakeFound
			}
		};
		this.state.playerList.map(player => {
			player.socket.emit('packet', packet);
		});
	};

	_emitFakeFoundPromptForGuess() {
		const packet = {
			type: 'prompt_fake_for_guess'
		};
		this.state.playerList.map(player => {
			player.socket.emit('packet', packet);
		});
	}

	_emitFakeGuessForApproval(guess) {	
		const packet = {
			type: 'get_approval_for_fake_guess',
			guess
		};
		this.state.playerList.map(player => {
			player.socket.emit('packet', packet);
		});
	}

	/**
	 * This function will find vote winner (or tie) from the Set this.fakeVotes.
	 * First a hashmap will count votes, which is converted to an array for sorting.
	 * @return {[type]} [description]
	 */
	_tallyFakeVotes() {
		console.log('Tallying Fake Votes')		
		let tally = {};
		let tallyArr = [];
		let isTie = false;
		let fakeNotFound = false;
		//We have to do this because at the moment the fakePlayer is stored before its color is assigned
		this.fakePlayer = this.state.playerList.filter(player => player.id === this.fakePlayer.id)[0];
		this.fakeVotes.forEach(player => {
			tally[player.vote] = tally.hasOwnProperty(player.vote) ? tally[player.vote] + 1 : 1;
		})
		for(let vote in tally) {
			tallyArr.push({
				color: vote,
				count: tally[vote]
			});
		};
		tallyArr.sort((a,b) => b.count - a.count);
		if(tallyArr.length > 1) { //This check shouldn't be needed, but I'm testing with one player right now
			if(tallyArr[0].count === tallyArr[1].count) {
				isTie = true;
				fakeNotFound = true;
			}
		}
		if(tallyArr[0].color !== this.fakePlayer.color) {
			fakeNotFound = true;
		}
		if(fakeNotFound) {
			//No further rounds necessary. The fake wins outright because he wasn't found 
			//and gets points. All players and their colors be revealed.
			this.isFakeWinner = true;
			this._concludeGame();
		}
		else {
			this.isFakeFound = true;
			this._emitFakeFoundPromptForGuess();
		}
	}

	_tallyApprovalVotes() {
		console.log('Tallying Approval Votes')
		//If there are a majority of votes approving (ties lose) the guess than the fake steals the win
		const totalVotes = this.votesToApprove.size;
		let yesVotes = 0;
		this.votesToApprove.forEach(value => {
			if (value === 'yes') yesVotes++;
		})
		this.isFakeWinner = (yesVotes > totalVotes / 2) ? true : false;
		this._concludeGame();
	}

	/**
	 * Game Conclusion cleanup logic. The main thing to note here is that we are able to access the ability
	 * to reset the Parent Session manager by using the session prop passed down at the beginning in the Game
	 * constructor
	 **/
	_concludeGame() {
		this._emitGameOverResults();
		this.session.resetSessionStatusAfterGame();
	}

	retrieveState() {
		return this.state;
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
		const turns = this.state.turnList
		if (!turns.length) {
			clearTimeout(this.state.currentTurnTimeout)
			this._initiateFakeVoteSequence();
		}
		else {
			this.state.currentTurn = turns.shift();
			this._broadcastTurn(this.state.currentTurn);
			this._startNextTurnTimer(this.state.currentTurn.turnId);
		}
	}

	_startNextTurnTimer(turnId) {
		clearTimeout(this.state.currentTurnTimeout)
		this.state.currentTurnTimeout = setTimeout(() => this._endTurnTimer(turnId), 17000);
	}

	/**
	 * Check if the previous turn is still active (ie the client doesn't have their tab open) and if so
	 * force end the turn.
	 * @param  {String} turnId [unique id used to compare turns against each other]
	 * 
	 */
	_endTurnTimer(turnId) {
		if(turnId === this.state.currentTurn.turnId && this.state.currentPhase === DRAWING) {
			this.nextTurn();
		}
	}

	addVoteForFake(vote) {
		//TODO Check if set already has client ID (double check for no double voting). Can do with Map as below.
		this.fakeVotes.add(vote)
		//Check if all votes are received and tally
		if(this.fakeVotes.size === this.state.playerList.length) {
			this._tallyFakeVotes()
		}
	}

	addVoteToApproveGuess(client, vote) {
		console.log('Adding vote to approve guess', client, vote)
		//Check to make sure the client isn't voting more than once
		if(!this.votesToApprove.has(client)) {
			this.votesToApprove.set(client, vote)
		}
		if(this.votesToApprove.size >= (this.state.playerList.length - 1)) {
			this._tallyApprovalVotes();
		}
	}

	receiveFakeGuess(guess) {
		console.log('Fake guess received: ', guess)
		this.state.fakeGuess = guess;
		this._emitFakeGuessForApproval(guess);
	}

}

module.exports = Game;
