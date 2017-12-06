const {app, io} = require('./app.js');
const requests = require('./requests_handler.js');

io.sockets.on('connection', function(socket){
   socket.on( 'startup', _ => { /* nothing for now */ } );
   socket.on( 'login:attempt', data => requests.login_attempt(data, socket) );
   socket.on( 'chat:message',  data => requests.chat_message(data, socket) );
   socket.on( 'userlist:startup', () => requests.user_joined(socket) );
   socket.on( 'disconnect', () => requests.user_left(socket) );
   socket.on( 'game:take_move', (data) => requests.take_move(data, socket) );
});

console.log('Started up.');
