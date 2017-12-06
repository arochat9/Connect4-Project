// import React from 'react';
// import ReactDOM from 'react-dom';
// import './game.css';

const XDIMENSION = 7;
const YDIMENSION = 6;
var gameBoardArray = [[],[]];

const Board = React.createClass({
   getInitialState() {
      for(let i = 0; i<XDIMENSION; i++) {
        gameBoardArray[i]=[];
      }
      return {
        status: "Playing against " + this.props.game_info.opponent + ". You are " +
               this.props.game_info.color + ". " + this.props.game_info.starts + " starts",
        squares: Array(42).fill(null),
        xIsNext: true
      };
   },

  clicker(i) {
    const squares = this.state.squares.slice();

    squares[i] = this.state.xIsNext ? 'Yellow' : 'Red';
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
    });
  },
  button_clicked(pos, event){
      socketio.emit('game:move', { pos });
      this.clicker(pos);
  },
  renderCol(i) {
    return (
      <button className = "column" onClick={ event => this.button_clicked(i, event) }>
      </button>
    );
  },

  // = 'Next player: ' + (this.state.xIsNext ? 'Yellow' : 'Red');
  componentDidMount() {
    // });
  },
  componentWillUnmount() {
    console.log("unmounting");
  },

  render() {
    return (
     <div>
       <div className="status">{this.state.status}</div>
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
  },

  render() {

    let rows = [];
    for (let x = 0; x < YDIMENSION; x++){
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


const Game = React.createClass({
  render() {
    return (
      <div className="game-board">
        <Board game_info={ this.props.game_info } />
        <Circles />
      </div>
    );
  }
});
