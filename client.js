var socketio = io.connect();
var username = undefined;

socketio.on('bar', (data) => {
   alert(JSON.stringify(data)); 
});

function login_attempt(username, password){
   console.log(`Attempted to login with username '${username}' and passowrd '${password}'.`);
   socketio.emit('login_attempt', { username, password });
   socketio.on('login_result', (data) => {
      switch( data.result ){
         case 'success':
            username = data.username;
            $('#login_popup').hide();
            $('#global_chat').show();
            $('#global_chat-header-username').text(username);
            break
         case 'failure':
            var reason = data.reason;
         default:
            if( typeof reason === undefined )
               var reason = `Unrecognized login result '${data.result}'`;
            var error = `Login failure: ${reason}`;
            console.error(error);
            $('#login_popup-error_box').text(error);
            $('#login_popup-error_box').show();
      }
   });
}

$(() => {
   socketio.emit('startup', {});

   $('#login_popup-submit').click( (event) => {
      event.preventDefault();
      var username = $('#login_popup-username').val(),
          password = $('#login_popup-password').val();
      login_attempt(username, password);
   });

   $('#login_popup').show();
   $('#global_chat').hide();

   console.info('Webpage Loaded');
});




