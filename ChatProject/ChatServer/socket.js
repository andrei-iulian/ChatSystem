module.exports = function(db, io) {
    console.log('Server Socket Initialised');

    io.on('connection', (socket) => {
        socket.on('disconnection', function() {
            console.log('Disconnect');
        });

        socket.on("add-message", (message) => {
            var group = message.split('//', 1);
        });
    })
}