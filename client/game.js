// import React from 'react';
// import ReactDOM from 'react-dom';
// import './game.css';

const XDIMENSION = 7;
const YDIMENSION = 6;


const Board = React.createClass({
   getInitialState() {
      return { squares: Array(42).fill(null), xIsNext: true };
   },

   componentDidMount() {
      socketio.emit('userlist:startup');
      socketio.on('game:take_move', this.move_taken);
   },

   move_taken(data){
      var x = data.x, y = data.y, player = data.player;
      console.log("Player '" + player + "' took a move at (" + x + ',' + y + ')');
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
      socketio.emit('game:take_move', { pos });
      this.clicker(pos);
  },
  renderCol(i) {
    return (
      <button className = "column" onClick={ event => this.button_clicked(i, event) }>
      </button>
      // <ColumnCreater
      //   value={this.state.squares[i]}
      //   onClick={() => this.clicker(i)}
      // />
    );
  },

  render() {
    let status = 'Next player: ' + (this.state.xIsNext ? 'Yellow' : 'Red');
    return (
     <div>
       <div className="status">{status}</div>
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

const Circles = React.createClass({

  render() {

    let rows = [];
    for (let x = 0; x < YDIMENSION; x++){
      let circleCells = [];
      for (let y = 0; y < XDIMENSION; y++){
        circleCells.push(<td key={y*10+x} id="${x} ${y}"></td>);
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
      <div className="game">
        <div className="game-board">
          <Board />
          <Circles />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
});

// ========================================


function startup_game_window(username){
   ReactDOM.render(<Game />, document.getElementById('connect4') );
}
