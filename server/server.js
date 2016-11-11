// Set up: npm install
var http = require("http"),
    ws = require("ws");

// HTTP server
var server = http.createServer(function(req, res) {

});
server.listen(8080);
server.on("error", function(err) {
    console.log("Failed to start server:", err);
});

// WebSocket adapter
var wss = new ws.Server({
    server: server
});
wss.on("connection", function(socket) {
    console.log("New WebSocket connection");
    socket.on("close", function() {
        console.log("WebSocket disconnected");
    });
    socket.on("message", function(data, flags) {
        if (flags.binary) {
            console.log("Received binary data");
        } else {
            console.log("Not binary data");
        }
    });
});
