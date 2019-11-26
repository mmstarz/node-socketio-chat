const path = require("path");
const http = require("http"); // changes for websockets io
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
// const moment = require("moment");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("../utils/users");
// const hbs = reuire('hbs');
// const mainRoutes = require("../routes/mainRoutes");
// utils
const { messageFormat, locationFormat } = require("../utils/messages");
// variables
const PORT = 3000 || process.env.PORT;
// express setup
const app = express();
const server = http.createServer(app); // create server outside the express library
const io = socketio(server); // create webSockets support for server

// assets folder html, css, js files
app.use(express.static(path.join(__dirname, "../public")));
// routes
// app.use(mainRoutes);
// Express will serve up index.html
// if it doesn't recognize the route
app.get("*", (req, res, next) => {
  res.sendFile(path.resolve(__dirname, "..", "public", "index.html"));
});

// web sockets configuration
// .on('listen name of the event' , () => {})
// .emit('send to name of the event', data)
// socket - fires for single connection
// io - global fires for every connection
io.on("connection", socket => {
  console.log("new connection established");
  // listen form user and chat room
  socket.on("userEntered", (options, callback) => {
    // store user
    const { error, user } = addUser({
      id: socket.id,
      ...options
    });

    if (error) {
      return callback({ error });
    }

    // special socketio method .join() setup specific separate channel
    // .join() - is used only on server side
    // socket.join('room') - defines a room to join
    // work only when room is defined
    // io.to('room').emit() - send event to everybody in a specific room
    // socket.broadcast.to('room').emit() - send event to everybody in a room except self
    socket.join(user.room);
    // send data to every newly connected client to this room
    // through custom event channel
    socket.emit("joinEvent", "Welcome to the Chat!");
    // send notification to all clients in this room except self
    socket.broadcast
      .to(user.room)
      .emit("notification", `${user.username} have joined`);
    callback({ notify: "Joint successfully!" });

    // update users list event
    io.to(user.room).emit("updateUsersList", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });

  // listen on new messgae from client
  socket.on("newMessage", (msg, callback) => {
    // find user
    const user = getUser(socket.id); // {id, username, room}

    // define bad-words filter
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      const updatedMsg = filter.clean(msg);
      // io.emit("newMessage", messageFormat(updatedMsg));
      socket.broadcast
        .to(user.room)
        .emit("newMessage", messageFormat(updatedMsg, user.username));
      socket.emit("myMessage", messageFormat(updatedMsg, user.username));
      return callback("Censored and delivered successfully!");
    }

    // send that message to all clients connected
    // io.emit("newMessage", messageFormat(msg));
    // socket.broadcast.to(user.room).emit("newMessage", messageFormat(msg));
    // socket.to(user.room).emit("myMessage", messageFormat(msg));
    socket.broadcast
      .to(user.room)
      .emit("newMessage", messageFormat(msg, user.username));
    socket.emit("myMessage", messageFormat(msg, user.username));
    // send acknldgmnt callback after message emit to users
    callback("Delivered successfully!");
  });

  socket.on("shareLocation", (coords, callback) => {
    const user = getUser(socket.id);
    // const msg = `Location is latitude ${latitude} and longitude: ${longitude}`;
    // send to all
    // io.emit("sharedLocation", locationFormat(coords));
    socket.broadcast
      .to(user.room)
      .emit("sharedLocation", locationFormat(coords, user.username));
    socket.emit("mySharedLocation", locationFormat(coords, user.username));

    callback();
  });

  // listen on client disconnect
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      // notify all users about user left the chat room
      io.to(user.room).emit(
        "leaveEvent",
        `${user.username} has left the chat!`
      );

      // update users list event
      io.to(user.room).emit("updateUsersList", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server successfully started at http://localhost:${PORT}`);
});
