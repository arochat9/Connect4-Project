var socketio = io.connect();
// socketio.on('chat-message')

socketio.on('game:start', (data) => {
   console.log("data: " + JSON.stringify(data));
   startup_game_window();
});

function login_success(username){
   $('#login_popup').hide();
   startup_global_chat(username);
}

function login_failure(reason){
   var error = `Login failure: ${reason}`;
   console.error(error);
   $('#login_popup-error_box').text(error);
   $('#login_popup-error_box').show();
}

function login_attempt(username, password){
   console.log(`Attempted to login with username '${username}' and passowrd '${password}'.`);
   socketio.emit('login:attempt', { username, password });
   socketio.on('login:result', (data) => {
      switch( data.result ){
         case 'success':
            login_success( data.username );
            break
         case 'failure':
            login_failure( data.reason );
            break;
         default:
            login_failure(`Unrecognized login result '${data.result}'`);
      }
      socketio.off('login:result');
   });
}

$(() => {
   socketio.emit('startup');

   $('#login_popup-submit').click( (event) => {
      event.preventDefault();
      var username = $('#login_popup-username').val(),
          password = $('#login_popup-password').val();
      login_attempt(username, password);
   });

   $('#login_popup').show();
   
   console.info('Webpage Loaded');
});
