const express = require("express");
const app = express();
const path = require("path");
const http = require("http");

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");

io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for location data from clients
    socket.on('send-location', (data) => {
        io.emit('receive-location', { id: socket.id, ...data });
    });

    // Notify all clients when a user disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected");
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});
