const initialState = {
	//Extract to separate reducer later
	playerName: '',
	// playerId: '', //TODO: Use thisfor socket message filtering and self-identification
	playerScore: 0,
	isLoggedIn: false,
	activeRooms: [],
	//game reducer stuff
	playerColor: '',
	players: [], //array of objects with keys NAME/COLOR
	isWaitingForPlayers: false,
	isInGame: false,
	isMyTurn: false,
	isFake: false,
	clue: '',
};

const gameReducer = (state = initialState, action) => {
	switch(action.type) {
		case 'SET_PLAYER_NAME':
			return ({
				...state,
				playerName: action.payload
			});
		case 'UPDATE_SCORE':
			return({
				...state,
				playerScore: state.playerScore + action.payload
			});
		case 'LOGIN':
			return({
				...state,
				isLoggedIn: true
			})
		case 'LOGOUT':
			return({
				...state,
				isLoggedIn: false
			})
		case 'UPDATE_ACTIVE_ROOMS':
			return({
				...state,
				activeRooms: action.payload
			})
		default:
			return state;
	}
}

export default gameReducer;