$(document).ready(function () {
  $.ajax({
    type: 'GET',
    url: '/users/',
    async: false,
    success: function (response) {
      document.getElementById('nicknameInput').innerHTML = '';
      let tempHtml = ``;

      tempHtml += `
      <label for="nickname">Nickname</label>
      <div class = "display-flex">
        <input
        type="nickname"
        class="form-control"
        id="nickname"
        value="${response.data.user[0]['nickname']}"
        readonly
      />
      <button
        class="btn btn-lg btn-info float-right"
        type="submit"
      >
        접속
      </button>
      </div>
      
      `;

      $('#nicknameInput').append(tempHtml);
    },
    error: function (response) {
      customAlert(response.responseJSON.errorMessage);
    },
  });
});

function customAlert(text) {
  $('#alertText').text(text);
  $('#alertModal').modal('show');
}

function logout() {
  $.ajax({
    type: 'GET',
    url: '/api/auth/logout',
    success: function (response) {
      customAlert(response.message);
      window.location.href = '/login';
    },
    error: function (response) {
      customAlert(response.responseJSON.message);
    },
  });
}

//* socket-------------------------------------------------------------
const socket = io();
const messageInput = document.getElementById('messageInput');
const roomInput = document.getElementById('roomInput');
const room = document.getElementById('room');

// 닉네임을 치기전에는 입력창 숨기기
messageInput.hidden = true;
roomInput.hidden = true;
room.hidden = true;

// 닉네임제출 이벤트발생
const nicknameInput = document.getElementById('nicknameInput');
nicknameInput.addEventListener('submit', handleNicknameSubmit);

function handleNicknameSubmit(event) {
  event.preventDefault();
  let input = document.getElementById('nickname').value;
  socket.emit('newUser', input, showRoom);
  roomName = input;
  input = '';
}

function showRoom() {
  nicknameInput.hidden = true;
  messageInput.hidden = false;

  // 관리자만 룸 목록 볼 수 있음
  if (nickname.value === '관리자') {
    room.hidden = false;
    roomInput.hidden = false;
    // 방 이름 보여주기
    const h3 = room.querySelector('h3');
    h3.innerText = `접속한 방 :  ${roomName}`;
  }

  // 메시지 전송이벤트 발생
  messageInput.addEventListener('submit', send);
}

function send(event) {
  event.preventDefault();
  // 입력된 데이터 가져오기
  const input = document.getElementById('test');
  let message = input.value;
  // 서버로 데이터와 함께 send 이벤트 전달
  socket.emit('message', { type: 'message', message: message });
  // 입력칸은 다시 빈칸으로 변경
  input.value = '';
}

socket.on('update', function (data) {
  const chat = document.getElementById('chat');
  const message = document.createElement('div');
  const node = document.createTextNode(`${data['name']}: ${data['message']}`);
  let className = '';

  // 타입에 따라 적용할 클래스를 다르게 지정
  switch (data['type']) {
    case 'message':
      className = 'other';
      break;

    case 'connect':
      className = 'connect';
      break;

    case 'disconnect':
      className = 'disconnect';
      break;
  }

  message.classList.add(className);
  message.appendChild(node);
  chat.appendChild(message);
});

socket.on('room_change', (rooms) => {
  const roomList = room.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    if (room !== '관리자') {
      const li = document.createElement('li');
      li.innerText = room;
      roomList.append(li);
    }
  });
});

// 관리자가 입장할 채팅방입력
roomInput.addEventListener('submit', handleRoomSubmit);

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = roomInput.querySelector('input');
  let room = input.value;
  //socket.send와 같은 역할
  socket.emit('enter_room', room, showRoom);
  roomName = room;
  input.value = '';
}
