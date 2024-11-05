const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const PORT = 3000;

const app = express();
const httpServer = createServer(app);
const socket = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
});

const groupID = 121212;
socket.on("connection", (s) => {
    console.log('socket id: ', s.id); // ojIckSD2jqNzOqIrAGzL
    console.log('data: ', groupID);
    socket.emit('recieveGroup', groupID); 
});


httpServer.listen(PORT, () => {
    console.log("server available at http://localhost:"+ PORT)
})

//make sure ReactJS works w/ sockets
//devMetric -> rate of user joining, rate of backend failure, firestore graph for number of connection per unit time
//socket.emit('user-ready',) -> counts all current users are ready
//server: socket.on('all ready', htmlpage) -> on all users ready send html page
//