const 
}

var _ = require('lodash'); 
var globalStore;

function getInstance(){ 
 if (!globalStore) globalStore = createStore();
 return globalStore;
}

function createStore() { 
 var currentState = {}; 
 var subscribers = []; 
 var currentReducerSet = {}; 
 currentReducer = function(state, action) { 
  return state; 
 };
 
 function dispatch(action) {
  var prevState = currentState;
  currentState = currentReducer(_.cloneDeep(currentState), action);
  subscribers.forEach(function(subscriber){
   subscriber(currentState, prevState);
  });
 }
 
 function addReducers(reducers) {
  currentReducerSet = _.assign(currentReducerSet, reducers);
  currentReducer = function(state, action) {
   var ret = {};
   _.each(currentReducerSet, function(reducer, key) {
    ret[key] = reducer(state[key], action);
   });
   return ret;
  };
 }
  
 function subscribe(fn) {
  subscribers.push(fn);
 }
  
 function unsubscribe(fn) {
  subscribers.splice(subscribers.indexOf(fn), 1);
 }
  
 function getState() {
  return _.cloneDeep(currentState);
 }
  
 return {
  addReducers,
  dispatch,
  subscribe,
  unsubscribe,
  getState
 };
}
module.exports = getInstance();

class Store {
  constructor() {
    this.subscribers = [];
    this.state = { 
      socketId: '',
      myId: '', //TEMP until auth and persistent login (necessary for self-identifying in state updates)
      //If coming from newroom route, no id will be provided, default to empty string
      sessionId: '',
      clientColor: 'black',
      chatMessages: [],
      hasVotedToBegin: false, //Used for conditionally rendering status display after voting
      sessionState: {
        players: [],
        currentSessionStatus: '', //['isWaitingForPlayers', 'isWaitingToStart', 'isGameActive']
      },
      gameState: {
        currentPhase: '', //['drawing', 'detecting', 'approving', 'gameover']
        currentTurn: '', //Player color (name is still secret)
        isMyTurn: false,
      }
    };   
  }

  

}