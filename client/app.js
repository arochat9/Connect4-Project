const Lobby = React.createClass({
   logout(_){
      window.location.reload(false); 
   },
   render(){
      return (
         <div>
            <button onClick={ this.logout }>logout</button>
            <button onClick={ this.props.rand_game }>random game</button>
            <FriendsList /> 
            <UserList chatroom={this.props.chatroom} username={this.props.username} />
            <ChatBox chatroom={this.props.chatroom} username={this.props.username} />
         </div>
      );
   }   
})

const App = React.createClass({
   getInitialState(){
      return {
         username: '',
         chatroom: '',
         login: true,
         lobby: false,
         game: false,
         game_info: { opponent: undefined, color: undefined, starts: undefined }
      };
   },

   componentDidMount() {
      socketio.emit('startup');
      console.info('Webpage loaded');
   },

   rand_game(event){
      event.preventDefault();
      socketio.emit('game:random');
      socketio.on('game:begin', data => {
         var {opponent, color, starts, chatroom} = data;
         this.setState({
            game: true,
            chatroom: data.chatroom,
            game_info: { opponent, color, starts }
         });
         socketio.off('game:begin');
         socketio.on('game:stop', (data) => {
            console.log("<ended game>");
            this.setState({ game: false, chatroom: data.chatroom });
            socketio.off('game:stop');
         });
      })
   },


   register_attempt(username, password, on_err, on_success){
      console.log("Attempting to register as " + username + "");
      socketio.emit('register:attempt', { username, password });
      socketio.on('register:result', data => {
         
         switch( data.result ){
            case 'success':
               on_success(`Succesfully registered as '${data.username}'.`);
               break
            case 'failure':
               console.log("Couldn't register:" + data.reason);
               on_err(data.reason);
               break;
            default:
               console.error('Unrecognized register result: ' + data.result);
         }
         socketio.off('register:result');
      });
   },

   login_attempt(username, password, on_err){
      console.log("Attempting to log in as " + username + "");
      socketio.emit('login:attempt', { username, password });
      socketio.on('login:result', data => {
         
         switch( data.result ){
            case 'success':
               this.setState({
                  login: false,
                  lobby: true,
                  username: data.username,
                  chatroom: data.chatroom
               });
               break
            case 'failure':
               console.log("Couldn't log in:" + data.reason);
               on_err(data.reason);
               break;
            default:
               console.error('Unrecognized login result: ' + data.result);
         }
         socketio.off('login:result');
      });
   },

   render() {
      return (
         <div className='app'>
            { this.state.game  ?
               <Game game_info={ this.state.game_info } /> : null }
            { this.state.login ?
               <LoginWindow
                  login_attempt={this.login_attempt}
                  register_attempt={this.register_attempt}
               /> : null }
            { this.state.lobby ?
               <Lobby
                  username={this.state.username}
                  chatroom={this.state.chatroom}
                  rand_game={this.rand_game}
               /> : null }
         </div>
      );
   }
});

const socketio = io.connect();

ReactDOM.render(<App />, document.getElementById('root') );
