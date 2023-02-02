var socket = io()
console.log("almost conneced");
socket.on("connection", (sum) => {
  console.log("successfully connected");
})

socket.on("new message", (msg) => {
  var user = msg.username
  var msg = msg.text
  console.log(msg)
  console.log("message recieved")
  var p = document.createElement("div");
  var message = document.getElementById("messages");
  p.className = "left_message";
  var div = document.createElement("div");
  div.className = "contain";
  //p.innerText = msg;
  var doc = document.createElement("p");
  doc.innerText = msg
  var doct = document.createElement("p");
  doc.className = "mtexts"
  doct.className = "username"
  doct.innerText = user
  p.append(doct)
  p.append(doc)
  div.appendChild(p)
  var diff = message.scrollHeight - message.scrollTop - message.clientHeight
  if (diff < 10) {
    message.appendChild(div);
    message.scrollTop = message.scrollHeight
  }
  else {
    console.log(message.scrollTop)
    console.log(message.scrollHeight)
    message.appendChild(div);
  }
})
socket.on("client", (clients) => {
  console.log("message recieved")
  var clientnum = document.getElementById("clients");
  document.getElementById("clients").innerText = clients + " connected";
})
