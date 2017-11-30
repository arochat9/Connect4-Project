const app = require('./app.js');
const requests = require('./requests_handler.js');
const socketio = require('socket.io');
const io = socketio.listen(app);

io.sockets.on('connection', function(socket){
   socket.on( 'startup', (_) => { /* nothing for now */ } );
   socket.on( 'login_attempt', (data) => requests.login_attempt(data, socket) );
});

console.log('Started up.');