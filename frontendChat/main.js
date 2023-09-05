const token = localStorage.getItem('token');

if (!token) {
  alert('You are not logged in please log in to continue');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

const socket = io('http://127.0.0.1:3600', {
  reconnect: false,
  query: { token },
});
socket.on('connect', () => {});

let client;

socket.on('auth-error', () => {
  alert('Auth error. please log in to continue');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

function convertToNode(html) {
  return document.createRange().createContextualFragment(html);
}

['user', 'logistics', 'store', 'farm'].forEach((type) => {
  socket.on(`${type}-connected`, (returnObject) => {
    client = returnObject.client;

    const div = document.createElement('div');
    div.classList.add(`btn`);
    div.classList.add(`start-chat-btn`);
    div.innerText = `Welcome, ${client.type} ${client.username}`;

    document
      .querySelector('.start-chat-btn')
      .insertAdjacentElement('afterend', div);
    // clear the chat

    const chatMessagesEl = document.querySelector('.chat-messages');

    chatMessagesEl.replaceChildren();

    // render the rooms
    renderAllRooms(returnObject.rooms);
  });
});

function renderFreshRoom(room) {
  const parentRoom = document.getElementById('parent-room-name');

  const roomNode = document.createElement('h2');
  roomNode.dataset.roomId = room._id;
  roomNode.id = 'room-name';
  roomNode.classList.add(`room-name-${room._id}`);
  roomNode.classList.add(`room`);

  const otherClientInRoom =
    room.user1._id !== client._id ? room.user1 : room.user2;

  roomNode.innerText = `${otherClientInRoom.type} | ${otherClientInRoom.username}`;
  roomNode.dataset.otherClient = JSON.stringify(otherClientInRoom);

  roomNode.addEventListener('click', renderAllChats);

  parentRoom.prepend(roomNode);
}
function renderRoom(room) {
  const parentRoom = document.getElementById('parent-room-name');

  const childElements = Array.from(parentRoom.childNodes);

  const className = `room-name-${room._id}`;

  const childElement = parentRoom.querySelector(`[data-room-id="${room._id}"]`);

  if (childElement) {
    childElement.remove();
  }

  const roomNode = document.createElement('h2');
  roomNode.dataset.roomId = room._id;
  roomNode.id = 'room-name';
  roomNode.classList.add(`room-name-${room._id}`);
  roomNode.classList.add(`room`);

  roomNode.classList.add('focus--room');

  const otherClientInRoom =
    room.user1._id !== client._id ? room.user1 : room.user2;

  roomNode.innerText = `${otherClientInRoom.type} | ${otherClientInRoom.username}`;
  roomNode.dataset.otherClient = JSON.stringify(otherClientInRoom);

  socket.emit('joinRoom', room._id);
  roomNode.addEventListener('click', renderAllChats);

  parentRoom.prepend(roomNode);
}

function renderAllRooms(rooms) {
  const parentRoom = document.getElementById('parent-room-name');

  parentRoom.replaceChildren();

  rooms.forEach((room) => {
    const roomNode = document.createElement('h2');
    roomNode.dataset.roomId = room._id;

    // console.log(room._id, 'line 133');
    roomNode.id = 'room-name';
    roomNode.classList.add(`room-name-${room._id}`);
    roomNode.classList.add(`room`);

    const otherClientInRoom =
      room.user1._id !== client._id ? room.user1 : room.user2;

    roomNode.innerText = `${otherClientInRoom.type} | ${otherClientInRoom.username}`;
    roomNode.dataset.otherClient = JSON.stringify(otherClientInRoom);

    socket.emit('joinRoom', room._id);
    roomNode.addEventListener('click', renderAllChats);
    parentRoom.appendChild(roomNode);
  });
}

function renderAllChats(e) {
  e.preventDefault();

  const roomCollection = document.getElementsByClassName('room');

  for (let i = 0; i < roomCollection.length; i++) {
    roomCollection[i].classList.remove('focus--room');
  }

  e.target.classList.add('focus--room');

  socket.emit('get-chats', e.target.dataset.roomId);
}

// ! check this event later and remove if not neccesary
socket.on('render-fresh-room', (room) => {
  otherClient = room.user1._id !== client._id ? room.user1 : room.user2;
  otherClientId = otherClient._id;
  otherClientType = otherClient.type;
  currentRoomId = room._id;
  renderFreshRoom(room);
});

socket.on('retrieve-chats', (chats) => {
  const chatMessagesEl = document.querySelector('.chat-messages');
  const chatFormContainer = document.querySelector('.chat-form-container');

  chatMessagesEl.replaceChildren();

  chatFormContainer.replaceChildren();

  chatMessagesEl.removeAttribute('data-room-id');
  chatMessagesEl.removeAttribute('data-otherClient');

  let otherClient;

  if (chats[0]) {
    chatMessagesEl.dataset.roomId = chats[0].room;

    otherClient =
      chats[0].from._id === client._id ? chats[0].to : chats[0].from;

    chatMessagesEl.dataset.otherClient = JSON.stringify(otherClient);
  }

  chats.forEach((chat) => {
    renderMessage(chat, chatMessagesEl);
  });

  chatFormContainer.removeAttribute('data-room-id');
  chatFormContainer.removeAttribute('data-otherClient');

  if (chats[0]) {
    chatFormContainer.dataset.roomId = chats[0].room;

    chatFormContainer.dataset.otherClient = JSON.stringify(otherClient);
  }

  showMessageForm(chatFormContainer);
});

socket.on('retrieve-message', (chat) => {
  // render room
  const room = {
    _id: chat.room,
    user1: chat.from,
    user2: chat.to,
  };

  renderRoom(room);

  // check if focus is on the chat

  const chatMessagesEl = document.querySelector('.chat-messages');
  if (chatMessagesEl.dataset.roomId === chat.room) {
    renderMessage(chat, chatMessagesEl);
  }
});

socket.on('no-client-error', (clientType) => {
  alert(`${clientType} does not exist!!`);
});

socket.on('client-retrieved', (roomId, otherClient) => {
  const roomCollection = document.getElementsByClassName('room');

  for (let i = 0; i < roomCollection.length; i++) {
    roomCollection[i].classList.remove('focus--room');
  }

  const roomExist = Array.from(roomCollection).find(
    (room) => room.cloneNode(true).dataset.roomId === roomId
  );

  if (roomExist) {
    const room = {
      user1: { ...client },
      user2: { ...otherClient },
      _id: roomId,
    };
    renderRoom(room);
  }
  const chatMessagesEl = document.querySelector('.chat-messages');
  const chatFormContainer = document.querySelector('.chat-form-container');
  chatMessagesEl.replaceChildren();
  chatFormContainer.replaceChildren();

  // chatMessagesEl.dataset.roomId = roomId;
  chatMessagesEl.removeAttribute('data-room-id');
  chatMessagesEl.dataset.otherClient = JSON.stringify(otherClient);

  // chatFormContainer.dataset.roomId = roomId;
  chatFormContainer.removeAttribute('data-room-id');
  chatFormContainer.dataset.otherClient = JSON.stringify(otherClient);

  showMessageForm(chatFormContainer);
});

function renderMessage(chat, chatMessagesEl) {
  const otherClient = JSON.parse(chatMessagesEl.dataset.otherClient);

  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');

  p.innerText =
    chat.from._id === client._id || chat.from === client._id
      ? 'You'
      : otherClient?.username;
  // p.innerText = chat.from?.username === 'You' ? 'You' : otherClient?.username;
  p.innerHTML += ` <span> ${formatTime(chat?.createdAt)}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = chat?.text;
  div.appendChild(para);
  chatMessagesEl.appendChild(div);
}

function formatTime(time) {
  return moment(time).format('LT');
}

function showMessageForm(chatMessagesEl) {
  const div = document.createElement('form');
  const input = document.createElement('input');

  input.id = 'msg';
  input.type = 'text';
  input.placeholder = 'Enter Message';
  input.required = true;
  input.autocomplete = 'off';
  input.autocomplete = 'off';

  const iEl = document.createElement('i');
  iEl.classList.add('fa-paper-plane');
  iEl.classList.add('fas');

  const button = document.createElement('button');
  button.classList.add('btn');
  button.innerText = ' Send';
  button.appendChild(iEl);

  div.appendChild(input);
  div.appendChild(button);

  div.dataset.otherClient = chatMessagesEl.dataset.otherClient;

  div.dataset.roomId = chatMessagesEl.dataset.roomId;

  div.addEventListener('submit', handleSendMessage);

  chatMessagesEl.appendChild(div);
}

function handleSendMessage(e) {
  e.preventDefault();
  const targetEl = e.target;

  const otherClient = JSON.parse(targetEl.dataset.otherClient);
  const roomId = targetEl.dataset.roomId;

  const inputEl = targetEl.querySelector('#msg');

  if (!inputEl.value?.trim()) return;

  const chatMessageEl = document.querySelector('.chat-messages');
  // add message to list of messages

  renderMessage(
    {
      from: {
        username: 'You',
        _id: client._id,
      },
      text: inputEl.value,
      createdAt: new Date().toISOString(),
    },
    chatMessageEl
  );

  chatMessageEl.scrollTo(0, chatMessageEl.scrollHeight);
  //!
  if (roomId && roomId !== 'undefined') {
    const room = {
      user1: { ...client },
      user2: { ...otherClient },
      _id: roomId,
    };

    // console.log('renderRoom normally');
    renderRoom(room);

    // emit event
    const chat = {
      from: client._id,
      fromType: client.type,
      to: otherClient?._id,
      toType: otherClient?.type,
      roomId: roomId,
      text: inputEl.value,
      socketId: socket.id,
    };

    // console.log(chat);
    socket.emit('send-message', chat);

    inputEl.value = '';
    return;
  }

  socket.emit('create-room', {
    user1: { ...client },
    user2: { ...otherClient },
    socketId: socket.id,
    text: inputEl.value,
  });
  // clear input
  inputEl.value = '';
}

socket.on('render-newly-created-room', (room, text) => {
  const otherClient = room.user1._id === client._id ? room.user2 : room.user1;

  room = {
    user1: { ...client },
    user2: { ...otherClient },
    _id: room._id,
  };
  renderRoom(room);

  const chatFormContainer = document.querySelector('.chat-form-container');
  chatFormContainer.replaceChildren();

  chatFormContainer.removeAttribute('data-room-id');
  chatFormContainer.dataset.roomId = room._id;

  showMessageForm(chatFormContainer);

  // emit event
  const chat = {
    from: client._id,
    fromType: client.type,
    to: otherClient?._id,
    toType: otherClient?.type,
    roomId: room._id,
    text,
    socketId: socket.id,
    // freshRoomRendered: roomId ? true : false,
  };

  // console.log(chat);
  socket.emit('send-message', chat);
});

document
  .querySelector('.start-chat-btn')
  .addEventListener('click', function (e) {
    e.preventDefault();

    let otherClientUserName = prompt(
      'enter the username of the person you want to chat with: '
    );
    otherClientUserName = otherClientUserName?.toLowerCase().trim();

    if (!otherClientUserName) {
      alert(
        'Error: enter the username of the person you want to chat with to continue'
      );
      return;
    }

    let otherClientType = prompt('Enter the type of user: ');

    otherClientType = otherClientType?.toLowerCase().trim();

    if (!otherClientType) {
      alert('Error: enter the type of user to continue');
      return;
    }

    if (!['user', 'logistics', 'store', 'farm'].includes(otherClientType)) {
      alert('Error: That is not a correct type');
      return;
    }

    // check if the client is in list of rooms rendered

    const childRoom = Array.from(
      document.getElementById('parent-room-name').childNodes
    ).find((child) => {
      // console.log(child.textContent.toLowerCase());
      return (
        child.textContent.toLowerCase() ===
        `${otherClientType} | ${otherClientUserName}`
      );
    });

    if (!childRoom) {
      // console.log(socket.id);
      socket.emit('get-client', {
        clientUserName: otherClientUserName,
        clientType: otherClientType,
        socketId: socket.id,
        fromClientId: client._id,
        fromClientType: client.type,
      });
      return;
    }

    const roomCollection = document.getElementsByClassName('room');

    for (let i = 0; i < roomCollection.length; i++) {
      roomCollection[i].classList.remove('focus--room');
    }

    const childRoomEl = childRoom.cloneNode(true);
    const roomId = childRoomEl.dataset.roomId;

    document
      .querySelector(`[data-room-id="${roomId}"]`)
      .classList.add('focus--room');

    const chatFormContainer = document.querySelector('.chat-form-container');
    chatFormContainer.replaceChildren();

    chatFormContainer.dataset.roomId = roomId;
    chatFormContainer.dataset.otherClient = childRoomEl.dataset.otherClient;

    const chatMessageContainer = document.querySelector('.chat-messages');
    chatMessageContainer.replaceChildren();

    chatMessageContainer.dataset.roomId = roomId;
    chatMessageContainer.dataset.otherClient = childRoomEl.dataset.otherClient;
  });
