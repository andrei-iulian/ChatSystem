module.exports = function(db, io) {
    console.log('Server Socket Initialised');

    io.on('connection', (socket) => {
        socket.on('disconnection', function() {
            console.log('Disconnect');
        });

        socket.on("join", (userData) => {
            socket.join(userData.channel);

            var str = "User-" + userData.user + ' Joined the Channel';
            socket.broadcast.to(userData.channel).emit('message', {type: 'admin', text:str})
        });

        socket.on("leave", (userData) => {
            var str = 'User-' + userData.user + ' Left the Channel';
            socket.broadcast.to(userData.channel).emit('message', {type: 'admin', text:str});
        });

        socket.on("add-message", (userData) => {
            db.collection('Channels').updateOne({'Channel': userData.channel}, {$push: {'Chat': {type: userData.type, text:userData.text, image: userData.image}}});
            socket.broadcast.to(userData.channel).emit('message', userData);
        });
    })
}