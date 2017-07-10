import 'whatwg-fetch';

//sync

export function login() {
	return({
		type: 'LOGIN'
	});
};

export function logout() {
	return({
		type: 'LOGOUT'
	})
}

export function updateScore(score) {
	return({
		type: 'UPDATE_SCORE',
		payload: score
	});
};

export function setPlayerName(name) {
	return({
		type: 'SET_PLAYER_NAME',
		payload: name
	});
};

export function updateActiveRooms(rooms) {
	return({
		type: 'UPDATE_ACTIVE_ROOMS',
		payload: rooms
	})
}

//async
export function playerLogin(name) {
	return function (dispatch) {
		dispatch(setPlayerName(name));
		dispatch(login());
		localStorage.setItem('localClient', JSON.stringify({name}))
	};
};

export function playerLogout() {
	return function (dispatch) {
		dispatch(setPlayerName(''));
		dispatch(logout());
		localStorage.clear();
	};
};

export function updateRoomsFromServer() {
	return function(dispatch) {
		fetch('http://localhost:8000/API/getactiveroomslist')
			.then(response => response.json())
			.then(json =>	dispatch(updateActiveRooms(json)))
			.catch(error => console.log('Error in API request', error))	
	}
}