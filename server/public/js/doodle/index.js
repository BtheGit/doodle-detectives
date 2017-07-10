//Connection Manager ('./components/ConnectionManager.js')
//Handles socket.io connection
const connectionManager = new ConnectionManager();
connectionManager.connect();

class Room {
  constructor() {
  }


  // //Handle new remote clients joining session or leaving session
  // //Create a filtered list of remote peers
  // //TODO? Can add more player state info through this function if needed later
  // handleSessionUpdate (clients) {
  //   const myId = clients.self;
  //   const peers = clients.players.filter(player => player.id !== myId)
  //   this.setState({playerList: peers})
  //   console.log('Playerlist updated', this.state.playerList)
  // }

  // handleSessionStateUpdate (sessionState) {
  //   //Do I need to filter local client out?
  //   // sessionState.players = sessionState.players.filter(player => player.id !== this.state.myId)
  //   this.setState({sessionState})
  // }

  // handleChatMessage (message) {
  //   this.setState({chatMessages: [...this.state.chatMessages, message]})
  // }

  // //TODO: For now I will use this hack to access the child component method
  // handlePath (path) {
  //   this.drawingboard.drawPath(path)
  // }

  // //Socket Emitters
  // emitChatMessage (content) {
  //   const packet = {
  //     type: 'chat_message',
  //     payload: {
  //       name: this.props.playerName,
  //       id: this.state.socketId,
  //       time: Date.now(),
  //       content
  //     }
  //   };

  //   this.socket.emit('packet', packet);
  // }

  // emitPath (path) {
  //   const packet = {
  //     type: 'path',
  //     payload: path
  //   };

  //   this.socket.emit('packet', packet);      
  // }

  // emitVoteToBegin() {
  //   //TODO Toggle Display (need to reset this when game initializes!)
  //   this.setState({hasVotedToBegin: true});
  //   const packet = {
  //     type: 'vote_to_begin',
  //   }
  //   this.socket.emit('packet', packet);
  // }

  //############### LIFECYCLE AND RENDER METHODS ####################

  renderDrawingboard() {
    // return (
    //   <Drawingboard 
    //     playerName={this.props.playerName}
    //     onRef = {ref => (this.drawingboard = ref)}
    //     emitPath = {this.emitPath}
    //     clientColor = {this.state.clientColor}
    //     clientId = {this.state.socketId}
    //     //TODO Gonna pass session/game state down for preventing drawing. This should be moved to redux store
    //     sessionStatus = {this.state.sessionState.currentSessionStatus}
    //     isMyTurn = {this.state.gameState.isMyTurn}
    //   />
    // )
  }

  renderChatroom() {
    // return (
    //   <Chatroom 
    //     messages = {this.state.chatMessages}
    //     emitChatMessage = {this.emitChatMessage}
    //   />     
    // )
  }

  //COMPONENTIZE THE STATUS DISPLAY POST HASTE
  selectStatusDisplay() {
    const currentState = this.state.sessionState.currentSessionStatus; //for brevity
    if(currentState === 'isGameActive') {
      // return <div>Game Active</div>; //This will not be a message. Showing turns/clues/etc. //GAME STATUS COMPONENT
    }
    else { //SESSION STATUS COMPONENT
      if(currentState === 'isWaitingForPlayers') {
        return this.renderStatusMessage('Waiting for Players');
      } 
      else if (currentState === 'isWaitingToStart') {
        return !this.state.hasVotedToBegin ? this.renderVoteToBegin() 
                                     : this.renderStatusMessage('Waiting for other players to vote.')
      }
      else {
        return this.renderStatusMessage('Waiting for Server...');
      }
    }
  }

  renderStatusDisplay() {
    // return (
    //   <div className='statusdisplay-container'>
    //     {this.selectStatusDisplay()}
    //   </div>
    // )
  }

  renderStatusMessage(message) {
    // return <div className="statusdisplay-message">{message}</div>
  }

  renderVoteToBegin() {
    // return(
    //   <div className='statusdisplay-votetobegin-container'>
    //     <button onClick={this.emitVoteToBegin}>Begin</button>
    //     <div>Vote 'Begin' to get this party started! Game will commence when all players vote.</div>
    //   </div>
    // )
  }

  render() {
    // return (
    //   <div id="room-container">
    //     {this.renderDrawingboard()}
    //     <div id="sidebar-container">
    //       {this.renderChatroom()}
    //       {this.renderStatusDisplay()}
    //     </div>        
    //   </div>
    // );
  }
}

// const socket = io.connect('/gameroom')

// socket.on('connect', () => {
//   console.log('Connected to server')
// })
// socket.on('disconnected', () => {
// })
