const users = require('./users.js'); 
const {io} = require('./app.js');

class Game {
   static next_game_id(){
      var ret = Game.__next_game_id;
      Game.__next_game_id += 1; // not atomic, whatever.
      return ret;
   }

   static matchmake(p1, p2){
      p1.servermsg_room(`New game started between '${p1.username}' and '${p2.username}'.`);
      var game = new Game(p1, p2);
      __games[game.room] = game;
   }

   constructor(p1, p2){
      this.room = 'game_' + Game.next_game_id();
      this.p1 = p1;
      this.p2 = p2;
      this.board = [[], [], [], [], [], [], []];
      p1.new_game(this, p2.username, 'red', true);
      p2.new_game(this, p1.username, 'yellow', false);
      this.current = p1;
   }
   check_for_win(){
      console.log("(TODO: Check for win)");
   }
   take_move(pl, data){
      if( pl !== this.current )
         return;
      var col = data.pos;
      if( col === undefined || this.column_full(col) )
         return;
      var x = col, y = this.board[x].length;
      this.board[col].push( pl.game.color );
      io.to(this.room).emit('game:move', { x, y, color: pl.game.color });
      console.log(`Player ${this.current.username} went at: (${x}, ${y}).`);
      this.check_for_win();
      if( this.current === this.p1 ){
         this.p1.socket.emit('game:turn:theirs');
         this.p2.socket.emit('game:turn:yours');
         this.current = this.p2;
      } else {
         this.p2.socket.emit('game:turn:theirs');
         this.p1.socket.emit('game:turn:yours');
         this.current = this.p1;
      }
   }

   column_full(col){
      var sum = 0;
      for(var row in this.board)
         if( this.board[col][row] !== undefined )
            sum += 1;
      // console.log(`Sum for ${col} = ${sum}`);
      return sum >= 6;
   }

   quit_game(){
      this.p1.quit_game();
      this.p2.quit_game();
      console.assert( this.p1.room === this.p2.room, "why arent the players in the same room after quitting?");
      this.p1.servermsg_room(`Game between ${this.p1.username} and ${this.p2.username} stopping...`);
      delete __games[this.room];
   }

}

Game.__next_game_id = 0;
const __games = {};


const random_users_queue = [];

exports.matchmake_random = function(user){
   if( user.game )
      return;
   if( random_users_queue.indexOf(user) !== -1 ){
      user.servermsg_room(`User ${user.username} is no longer awaiting a random game`);
      random_users_queue.splice( random_users_queue.indexOf(user), 1 );
      return;
   }
   var opponent = random_users_queue.pop();
   user.servermsg_room(`User ${user.username} is awaiting a random game`);
   if( opponent )
      Game.matchmake(opponent, user);
   else {
      random_users_queue.push( user );
   }
}

// function matchmake_specific(user, opponent){
//    if( specific_users_queue )
//    if( specific_users_queue[user.username] )
// }

// exports.matchmaking_friends = function(data, socket){
//    var user = users.from_socket(socket);
//    var valid_opponents = data.valid_opponents;
//    if( !user || !valid_opponents )
//       return;
//    if( !(valid_opponents instanceof Array) ){
//       console.error(`Got non-array '${JSON.stringify(valid_opponents)}' for valid_opponents`);
//       return;
//    }
//    matchmake(user, valid_opponents);
// }

// exports.matchmaking_random = function(socket) {
//    var user = users.from_socket(socket);
//    if( !user )
//       return;
//    matchmake_random(user);
// }



