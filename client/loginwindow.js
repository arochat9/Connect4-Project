const ErrorBox = React.createClass({
   render(){
      return (
         <div className='error_box'>{ this.props.msg }</div>
      );
   }
});

const LoginWindow = React.createClass({
   getInitialState(){
      return { error_msg: null, username: '', password: '' };
   },
   submit(event){
      event.preventDefault();
      this.props.login_attempt(this.state.username, this.state.password,error_msg => this.setState({ error_msg }));
   },
   render(){
      return (
         <div>
         <form onSubmit={ this.submit } id="login_popup" >
            {this.state.error_msg ? <ErrorBox msg={this.state.error_msg} /> : null }
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
            <button>login!</button>
         </form>
         </div>
      );
   }
});