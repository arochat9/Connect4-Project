import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const XDIMENSION = 7;
const YDIMENSION = 6;

function socketioEmit(props) {
  //EMIT INFO TO SERVER
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(42).fill(null),
      xIsNext: true,
    };
  }

  clicker(i) {
    const squares = this.state.squares.slice();

    squares[i] = this.state.xIsNext ? 'Yellow' : 'Red';
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
    });
  }

  renderCol(i) {
    return (
      <button className = "column" onClick={() => {
        socketioEmit(i)
        this.clicker(i)
      }}>
      </button>
      // <ColumnCreater
      //   value={this.state.squares[i]}
      //   onClick={() => this.clicker(i)}
      // />
    );
  }

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
}
class Circles extends React.Component {

  render() {

    let rows = [];
    for (let x = 0; x < YDIMENSION; x++){
      let circleCells = [];
      for (let y = 0; y < XDIMENSION; y++){
        circleCells.push(<td id="${x} ${y}"></td>);
      }
      rows.push(<tr id={x}>{circleCells}</tr>)
    }

    return (
      <table id="simple-board">
         <tbody>
           {rows}
         </tbody>
       </table>
    );
  }
}


class Game extends React.Component {
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
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
