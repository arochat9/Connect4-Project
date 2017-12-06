const PrivateMessage = React.createClass({
   render() {
      return (
         <div className="chatlog-message">
            [<User username={this.props.from} /> 
               &nbsp;-&gt;&nbsp;
            <User username={this.props.to} />]
            &nbsp;&nbsp;
            <span className='chatlog-message-text'>{this.props.text}</span>
         </div>
      );
   }
});

const PublicMessage = React.createClass({
   render() {
      return (
         <div className="chatlog-message">
            <User username={this.props.username} />&nbsp;&nbsp;
            <span className='chatlog-message-text'>{this.props.text}</span>
         </div>
      );
   }
});


const MAX_MESSAGE_LENGTH = 50;
const ChatLog = React.createClass({
   getInitialState() {
      return { messages:[] };
   },

   componentDidMount() {
      socketio.on('chat:message', this.receive_chat);
      socketio.on('chat:private', this.receive_private);
   },

   receive_chat(message){
      var messages = this.state.messages;
      var {username, text} = message;
      console.log(`User '${username}' said: ${text}`);
      messages.push({ username, text });
      if( messages.length > MAX_MESSAGE_LENGTH )
         messages.splice(0, 1);
      this.setState({ messages });
   },
   receive_private(message){
      var messages = this.state.messages;
      var {from, to, text} = message;
      console.log(`User '${message.username}' said: ${message.text}`);
      messages.push({ from, to, text });
      this.setState({ messages });
   },
   render(){
      return (
         <div className='chatlog-container'>
            <h3 className='chatlog-title'>Messages</h3>
            <ul className='chatlog-messages'>{
               this.state.messages.map(x => x).reverse().map((msg, i) => 
                  msg.from
                     ? ( <PrivateMessage key={i} from={msg.from} to={msg.to} text={msg.text} />)
                     : ( <PublicMessage key={i} username={msg.username} text={msg.text} />
               ))
            }</ul>
         </div>
      );
   },
});

const MessageBox = React.createClass({
   getInitialState(){
      return { text: '', chatroom: null };
   },

   componentDidMount(){
      socketio.emit('chat:startup');
      socketio.on('chat:room:change', data => this.setState({ chatroom: data.room }));
   },

   submit(event){
      event.preventDefault();
      var text = this.state.text;
      var matches = text.match(/^\/w\s+(\w+)\s+(.+)$/);
      if( matches )
         socketio.emit('chat:private', { to: matches[1], text: matches[2] });
      else
         socketio.emit('chat:message', { text: this.state.text });
      this.setState({ text: '' });
   },

   update_text(event){
      this.setState({ text : event.target.value });
   },

   render(){
      return (
         <div>
            <h2>Hello, <User username={this.props.username} />. {
               (this.state.chatroom === null || this.state.chatroom === 'global')
                  ? '' 
                  : <span>You are talking in <strong>{this.state.chatroom}</strong></span>
               }</h2>
               <p>Hint: to message someone, type <code>/w username message</code></p>
            <form onSubmit={this.submit}>
               <input
                  onChange={this.update_text}
                  value={this.state.text}
                  size='120'
                  placeholder='...'
               />
            </form>
         </div>
      );
   }
   // <button>send</button>

});

const ChatBox = React.createClass({
   render(){
      return (
         <div>
            <MessageBox username={this.props.username} />
            <ChatLog />
         </div>
      );
   }
});

