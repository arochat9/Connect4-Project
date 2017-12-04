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

   class Square extends React.Component {
      render() {
        return (
          <button className="square">
            {/* TODO */}
          </button>
        );
      }
    }

    class Board extends React.Component {
      renderSquare(i) {
        return <Square />;
      }

      render() {
        const status = 'Next player: X';

        return (
          <div>
            <div className="status">{status}</div>
            <div className="board-row">
              {this.renderSquare(0)}
              {this.renderSquare(1)}
              {this.renderSquare(2)}
            </div>
            <div className="board-row">
              {this.renderSquare(3)}
              {this.renderSquare(4)}
              {this.renderSquare(5)}
            </div>
            <div className="board-row">
              {this.renderSquare(6)}
              {this.renderSquare(7)}
              {this.renderSquare(8)}
            </div>
          </div>
        );
      }
    }

    class Game extends React.Component {
      render() {
        return (
          <div className="game">
            <div className="game-board">
              <Board />
            </div>
            <div className="game-info">
              <div>{/* status */}</div>
              <ol>{/* TODO */}</ol>
            </div>
          </div>
        );
      }
    }

    // ========================================

    ReactDOM.render(
      <Game />,
      document.getElementById('root')
    );

});
