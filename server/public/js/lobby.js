'use strict'

const menuContainer = document.getElementById('menu-container'); 
const usersContainer = document.getElementById('lobby-users-list')
let menuUpdateHandler;

const socket = io.connect('/lobby')
socket.on('connect', () => {
  console.log('Connected to server')
  menuUpdateHandler = setInterval(reqUpdates, 2000);
})
socket.on('disconnected', () => {
  clearInterval(menuUpdateHandler);
})

socket.on('getUpdate', (pkt) => {
  updateRoomsMenu(pkt.rooms);
  updateLobbyUsers(pkt.users);
})


/**
 * SetInterval callback function to ask server for next update
 * 
 */
function reqUpdates() {
  socket.emit('reqUpdate');
}


/**
 * Manually update container div with formatted rooms list
 * @param  {Array} roomsList [Array of Objects containing sessionId, clients, size]
 * 
 */
function updateRoomsMenu(array = []) {
  let content = '';
  if(array.length) {
    for (let i = 0; i < array.length; i++) {
      const link = array[i].pop >= 8 
        ? `<p class="room-button full-button">ROOM FULL</p>` 
        : `<a class="room-button join-button" href="/doodle/room/${array[i].sessionId}" >JOIN</a>`
      const room =
         `<div class="room-container">
          <div class="room-name">
            ${array[i].clients}
          </div>
          <div class="room-pop">
            ${array[i].pop} / 8
          </div>
          <div class="room-link">
            ${link}
          </div>
        </div>`;
      content += room
    }
  } else {
    content=`<div class='no-cases'><p>NO OPEN CASES</p></div>`
  }
  menuContainer.innerHTML = content;
}

/**
 * Manually update container div with user list
 * @param  {Array} userList [Array of strings of user names]
 * 
 */
function updateLobbyUsers(userList = []) {
  let content = '';
  if (userList.length) {
    content = userList.map(user => {
      return `<div class="user">${user}</div>`
    })
    content = `<div class="user-list">${content.join('')}</div>`;
  }
  else {
    content=`<div class="user-list"><div class="user">Lobby Empty</div></div>`
  }
  usersContainer.innerHTML = content;
}
