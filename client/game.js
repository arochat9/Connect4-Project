
const XDIMENSION = 7;
const YDIMENSION = 6;
var playerColor;
var opponentColor;
var turnCounter = 0;
var gameBoardArray = [[],[]];

const Board = React.createClass({
   getInitialState() {
      for(let i = 0; i<XDIMENSION; i++) {
        gameBoardArray[i]=[];
      }
      playerColor = this.props.game_info.color;
      if(playerColor === "red") opponentColor = "yellow";
      else opponentColor = "red";
      return {
        status: turnCounter+" turn(s) so far. Playing against " + this.props.game_info.opponent + ". You are " +
               this.props.game_info.color + ". " + this.props.game_info.starts + " is up.",
        turn: this.props.game_info.color === this.props.game_info.starts,
        secondsLeft: 0
      };
   },
   tick: function() {//when timer runs out player goes in a random spot
     this.setState({secondsLeft: this.state.secondsLeft - 1});
     if (this.state.secondsLeft <= 0) {
       // clearInterval(this.interval);
       this.button_clicked(Math.floor(Math.random() * 7));
     }
   },
   componentDidMount(){
     this.setState({ secondsLeft: this.props.secondsLeft });
     this.interval = setInterval(this.tick, 1000);

     this.props.setturn_callback( turn => {
       turnCounter++;
       if(turn) {
         this.setState({
           secondsLeft: 20,
           turn,
           status: turnCounter+" turn(s) so far. Playing against " + this.props.game_info.opponent + ". You are " +
                  this.props.game_info.color + ". " + playerColor + " is up.",
         });
       }
       else {
         this.setState({
           secondsLeft: 20,
           turn,
           status: turnCounter+" turn(s) so far. Playing against " + this.props.game_info.opponent + ". You are " +
                  this.props.game_info.color + ". " + opponentColor + " is up.",
         });
       }
     });
  },
  componentWillUnmount: function(){
     clearInterval(this.interval);
  },

  button_clicked(pos){
    if(this.state.turn === true) {
      this.state.secondsLeft = 20;
      socketio.emit('game:move', { pos });
      console.log("BUTTON PRESSED");
      //this.clicker(pos);
      this.state.turn = false;
    }
  },
  renderCol(i) {
    return (
      <button className = "column" onClick={ event => this.button_clicked(i) }>
      </button>
    );
  },

  render() {
    return (
     <div>
       <div className="status">{this.state.status} {this.state.secondsLeft} seconds left.</div>
       <div className="board-row">
         {this.renderCol(0)}
         {this.renderCol(1)}
         {this.renderCol(2)}
         {this.renderCol(3)}
         {this.renderCol(4)}
         {this.renderCol(5)}
         {this.renderCol(6)}
       </div>
     </div>
   );
  }
});

const yellowStyle = {
  background: '#ffff00',
};
const redStyle = {
  background: '#ff0000',
};
const whiteStyle = {
  background: '#ffffff',
};

const Circles = React.createClass({

  componentDidMount() {
     socketio.on('game:move', this.move_taken);
  },

  move_taken(data){
     var {x, y, color} = data;
     //console.log("Player '" + color + "' took a move at (" + x + ',' + y + ')');
     gameBoardArray[y][x] = color;
     console.log(color+" color took a move at (" + x + ',' + y + ')');
     this.circles = new Circles();
     this.forceUpdate();
     if(playerColor != color) {
       this.props.set_turn(true);
     }
     else {
       this.props.set_turn(false);
     }
  },

  render() {

    let rows = [];
    for (let x = YDIMENSION-1; x >= 0; x--){
      let circleCells = [];
      for (let y = 0; y < XDIMENSION; y++){
        var idCords = `${x}${y}`;
        if(gameBoardArray[x][y] == 'red') {
          circleCells.push(<td key={y*10+x} style={redStyle} ref={idCords}></td>);
        }
        else if(gameBoardArray[x][y] == 'yellow') {
          circleCells.push(<td key={y*10+x} style={yellowStyle} ref={idCords}></td>);
        }
        else {
          circleCells.push(<td key={y*10+x} style={whiteStyle} ref={idCords}></td>);
        }
      }
      rows.push(<tr key={x} id={x}>{circleCells}</tr>)
    }

    return (
      <table id="simple-board">
         <tbody>
           {rows}
         </tbody>
       </table>
    );
  }
});


const Game = React.createClass({//parent class
  getInitialState() {
    return {turn_callback: undefined};
  },
  componentDidMount() {
     socketio.on('game:winner', data => {
       alert(data.winner+ " has won");
     });
  },
  set_turn(turn){
    console.log("SET TURN METHOD WAS CALLED. turn set to: "+turn);
    this.state.turn_callback(turn);
  },
  setturn_callback(turn_callback){//callback function
    this.setState({ turn_callback });
  },
  render() {//parent rendering
    return (
      <div className="game-board">
        <Board
          game_info={ this.props.game_info }
          setturn_callback={this.setturn_callback}
          secondsLeft="20"
        />
        <Circles set_turn={this.set_turn}/>
      </div>
    );
  }
});
