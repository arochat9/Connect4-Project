const {app, io} = require('./app.js');
const requests = require('./requests_handler.js');
const game = require('./game.js');

io.sockets.on('connection', function(socket){
   socket.on( 'startup', _ => { /* nothing for now */ } );
   socket.on( 'login:attempt', data => requests.login_attempt(data, socket) );
   socket.on( 'register:attempt', data => requests.register_attempt(data, socket) );
   socket.on( 'disconnect', () => requests.user_left(socket) );
   socket.on( 'userlist:startup', () => requests.user_joined(socket) );
   socket.on( 'friends:startup', () => requests.list_friends(socket) );
   socket.on( 'friends:add', data => requests.add_friend(data, socket) );
   socket.on( 'friends:del', data => requests.del_friend(data, socket) );
   socket.on( 'friends:list', () => requests.list_friends(socket) );

});

console.log('Started up.');
