class ConnectionManager {
	constructor() {
    this.socket = null;
  }

	connect(){
    this.socket = io.connect('/gameroom');
    this.socket.on('connect', () => {
      this.socket.emit('setup_client', {
        sessionId: state.sessionId
      })
    });
    this.socket.on('packet', this.handleSocketMessages)		
	}

  handleSocketMessages(packet) {
    if(packet.type === 'setup_client') {
      //Handle user name/socket id/etc. here
      //Player color and such will be created later when game starts
      // this.setState({
      //   sessionId: packet.payload.id, 
      //   clientColor: packet.payload.color,
      //   chatMessages: packet.payload.chatLog
      // });
      console.log('Session:', state.sessionId)
    }
    else if(packet.type === 'temp_get_myid'){
      // this.setState({myId: packet.id})
    }
    else if (packet.type === 'broadcast_session') {
      this.handleSessionUpdate(packet.clients)
    }
    else if(packet.type ==='chat_message') {
      this.handleChatMessage(packet.payload);
    }
    else if(packet.type === 'path') {
      this.handlePath(packet.payload);
    }
    else if(packet.type === 'session_state_update') {
      this.handleSessionStateUpdate(packet.sessionState);
    }
    else if(packet.type === 'game_state_update') {
      //set local isGameActive toggle here which will prevent drawing unless activePlayer is me
      this.handleGameStateUpdate(packet.gameState);
    }
    else if(packet.type === 'display_secret_phase') {
      this.handleDisplaySecretPhase(packet.payload);
    }    
  }

    //Handle new remote clients joining session or leaving session
  //Create a filtered list of remote peers
  //TODO? Can add more player state info through this function if needed later
  handleSessionUpdate (clients) {
    const myId = clients.self;
    const peers = clients.players.filter(player => player.id !== myId)
    // this.setState({playerList: peers})
    console.log('Playerlist updated', state.playerList)
  }

  handleSessionStateUpdate (sessionState) {
    //Do I need to filter local client out?
    // sessionState.players = sessionState.players.filter(player => player.id !== this.state.myId)
    // this.setState({sessionState})
  }

  handleChatMessage (message) {
    // this.setState({chatMessages: [...this.state.chatMessages, message]})
  }

  //This needs to go to the store which can be subscribed to read for rendering
  //Or can just trigger a rerender here?
  handlePath (path) {
    this.drawingboard.drawPath(path)
  }

    //Socket Emitters
  emitChatMessage (content) {
    const packet = {
      type: 'chat_message',
      payload: {
        // name: this.props.playerName,
        id: state.socketId,
        time: Date.now(),
        content
      }
    };

    this.socket.emit('packet', packet);
  }

  emitPath (path) {
    const packet = {
      type: 'path',
      payload: path
    };

    this.socket.emit('packet', packet);      
  }

  emitVoteToBegin() {
    //TODO Toggle Display (need to reset this when game initializes!)
    // this.setState({hasVotedToBegin: true});
    const packet = {
      type: 'vote_to_begin',
    }
    this.socket.emit('packet', packet);
  }

}