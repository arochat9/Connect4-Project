games = {}

exports.send_active = function(user) {
   user.socket.emit('games_types', {})
}
