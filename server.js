const socketio = require('socket.io');
const app = require('app.js');

var io = socketio.listen(app);
io.sockets.on('connection', function(socket){
   socket.on('foo', (data) => {
      data['bar'] = 99;
      console.log(data);
      socket.emit('bar', data);
   });
   // socket.on('client-send-post',  (data) => { client_send_post(socket, data); });
   // socket.on('client-send-post2',  (data) => { client_send_post2(socket, data); });
   // socket.on('client-send-msg',  (data) => { client_send_msg(socket, data); });
   // socket.on('client-login-attempt', (data) => { client_login_attempt(socket, data); });
   // socket.on('client-kick-user', (data) => { client_kick_user(socket, data); });
   // socket.on('client-ban-user', (data) => { client_ban_user(socket, data); });
   // socket.on('client-logout', (_) => { client_disconnect(socket); });
   // socket.on('client-startup', (_) => { client_startup(socket); });
   // socket.on("disconnect", () => { client_disconnect(socket); });
});
