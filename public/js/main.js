const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const msgInput = document.getElementById("msg");
const feedback = document.getElementById("feedback");
var typing = false;
var timeout = undefined;
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log(username, room);

const socket = io();

msgInput.addEventListener("keypress", (e) => {
  if (e.which != 13) {
    socket.emit("typing");
  }
});

//join chatRoom
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});
socket.on("typing", (data) => {
  feedback.innerHTML = `<p><i> ${data.username} is typing a message...</i></p>`;
  setTimeout(() => {
    feedback.innerHTML = "";
  }, 3000);
});

//message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get msg text
  const msg = e.target.elements.msg.value;
  console.log(msg);

  //emit msg to server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//output msg to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
<p class="text">
  ${message.text}
</p>`;
  chatMessages.appendChild(div);
}

//add room and users to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}
function outputUsers(users) {
  userList.innerHTML = `
    ${users
      .map(
        (user) =>
          `<li><i class="fa fa-paw" aria-hidden="true"></i> ${user.username}</li>`
      )
      .join("")}
    `;
}
