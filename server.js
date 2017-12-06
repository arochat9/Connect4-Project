const {app, io} = require('./app.js');
const requests = require('./requests_handler.js');
const game = require('./game.js');

io.sockets.on('connection', function(socket){
   socket.on( 'startup', _ => { /* nothing for now */ } );
   socket.on( 'login:attempt', data => requests.login_attempt(data, socket) );
   socket.on( 'disconnect', () => requests.user_left(socket) );
});

console.log('Started up.');
