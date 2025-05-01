const socket = io();

let selectedAvatar = null;

// Avatar selection logic
document.querySelectorAll('.avatar').forEach(avatar => {
  avatar.addEventListener('click', () => {
    document.querySelectorAll('.avatar').forEach(a => a.classList.remove('selected'));
    avatar.classList.add('selected');
    selectedAvatar = avatar.getAttribute('data-avatar');
  });
});

// DOM elements
const joinForm = document.getElementById('join-form');
const joinContainer = document.getElementById('join-container');
const chatContainer = document.getElementById('chat-container');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');

// Handle join form submission
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const room = document.getElementById('room').value.trim();

  if (!username || !room || !selectedAvatar) {
    alert('Please fill in all fields and select an avatar.');
    return;
  }

  socket.emit('joinRoom', { username, room, avatar: selectedAvatar });

  joinContainer.classList.add('hidden');
  chatContainer.classList.remove('hidden');
});

// Handle sending chat messages
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msgInput = e.target.msg;
  const msg = msgInput.value.trim();
  if (!msg) return;

  socket.emit('chatMessage', msg);
  msgInput.value = '';
  msgInput.focus();
});

// Receive message and display in chat
socket.on('message', (message) => {
  const avatarPath = message.avatar ? `/assets/avatars/${message.avatar}` : '/assets/avatars/default.png';

  const div = document.createElement('div');
  div.innerHTML = `
    <p class="meta">
      <img src="${avatarPath}" alt="avatar" class="msg-avatar" />
      <strong>${message.username}</strong> <span>${message.time}</span>
    </p>
    <p class="text">${message.text}</p>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Receive room info and update sidebar
socket.on('roomUsers', ({ room, users }) => {
  roomName.innerText = room;
  usersList.innerHTML = users.map(user => `<li>${user.username}</li>`).join('');
});

// Handle leave button
document.getElementById('leave-btn').addEventListener('click', () => {
  window.location.reload();
});

// Enable user search
document.getElementById('user-search').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('#users li').forEach(userItem => {
      const name = userItem.textContent.toLowerCase();
      userItem.style.display = name.includes(searchTerm) ? '' : 'none';
    });
  });
  

socket.on('roomExists', msg => {
  alert(msg); // This Connect ID is already in use. Please choose another.
});