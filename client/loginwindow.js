const SuccessBox = React.createClass({
   render(){
      return (
         <div className='success_box'>{ this.props.msg }</div>
      );
   }
});

const ErrorBox = React.createClass({
   render(){
      return (
         <div className='error_box'>{ this.props.msg }</div>
      );
   }
});


const LoginWindow = React.createClass({
   getInitialState(){
      return { error_msg: null, success_msg: null, username: '', password: '', };
   },
   login(event){
      event.preventDefault();
      this.props.login_attempt(this.state.username, this.state.password, this.set_err_msg);
   },
   register(event){
      event.preventDefault();
      this.props.register_attempt(this.state.username, this.state.password,
                                  this.set_err_msg,
                                  this.set_success_msg);
   },

   set_err_msg(error_msg){
      this.setState({ error_msg, success_msg: '' });
   },

   set_success_msg(success_msg){
      this.setState({ success_msg, error_msg: '' });
   },

   render(){
      return (
         <div>
         <form id="login_popup" >
            {this.state.error_msg ? <ErrorBox msg={this.state.error_msg} /> : null }
            {this.state.success_msg ? <SuccessBox msg={this.state.success_msg} /> : null }
            <input
               onChange={ event => this.setState({ username : event.target.value }) }
               value={ this.state.username }
               placeholder='Username'
            />
            <br />
            <input
               onChange={ event => this.setState({ password : event.target.value }) }
               value={ this.state.password }
               placeholder='Password'
            />
            <br />
            <button onClick={ this.login }>Login!</button>
            <button onClick={ this.register }>Register</button>
         </form>
         </div>
      );
   }
});