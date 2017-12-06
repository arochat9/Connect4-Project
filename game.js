const users = require('./users.js');
const {io} = require('./app.js');

class Game {
   static next_game_id(){
      var ret = Game.__next_game_id;
      Game.__next_game_id += 1; // not atomic, whatever.
      return ret;
   }

   static matchmake(p1, p2){//creating a new match
      p1.servermsg_room(`New game started between '${p1.username}' and '${p2.username}'.`);
      var game = new Game(p1, p2);
      __games[game.room] = game;
   }

   constructor(p1, p2){//constructor for setting up server side for new game
      this.room = 'game_' + Game.next_game_id();
      this.p1 = p1;
      this.p2 = p2;
      this.board = [[], [], [], [], [], [], []];
      p1.new_game(this, p2.username, 'yellow', true);
      p2.new_game(this, p1.username, 'red', false);
      this.current = p1;
   }
   check_for_win(){
      //vertical winnning --> board[][]
      for(let horiz = 0; horiz < this.board.length; horiz++) {
        for(let counter = 0; counter < 3; counter++) {
          let temp = this.board[horiz][counter];
          if(temp === this.board[horiz][counter+1] && temp === this.board[horiz][counter+2]
             && temp === this.board[horiz][counter+3]) {
              if(temp === "red") {
                console.log("red winner for horizontal");
                this.p1.socket.emit('game:winner', { winner: "red" });
                this.p2.socket.emit('game:winner', { winner: "red" });
                this.quit_game();
                this.p1.servermsg_room(`${this.p2.username} beat ${this.p1.username} in connect-4!`);
              }
              else if(temp === "yellow") {
                console.log("yellow winner for horizontal");
                this.p1.socket.emit('game:winner', { winner: "yellow" });
                this.p2.socket.emit('game:winner', { winner: "yellow" });
                this.quit_game();
                this.p1.servermsg_room(`${this.p1.username} beat ${this.p2.username} in connect-4!`);
              }
          }
        }
      }
      //horizontal winning
      for(let vert = 0; vert < 6; vert++) {
        for(let counter = 0; counter < this.board.length-3; counter++) {
          let temp = this.board[counter][vert];
          if(temp === this.board[counter+1][vert] && temp === this.board[counter+2][vert]
             && temp === this.board[counter+3][vert]) {
               if(temp === "red") {
                 console.log("red winner for vertical");
                 this.p1.socket.emit('game:winner', { winner: "red" });
                 this.p2.socket.emit('game:winner', { winner: "red" });
                 this.quit_game();
                 this.p1.servermsg_room(`${this.p2.username} beat ${this.p1.username} in connect-4!`);
               }
               else if(temp === "yellow") {
                 console.log("yellow winner for vertical");
                 this.p1.socket.emit('game:winner', { winner: "yellow" });
                 this.p2.socket.emit('game:winner', { winner: "yellow" });
                 this.quit_game();
                 this.p1.servermsg_room(`${this.p1.username} beat ${this.p2.username} in connect-4!`);
               }
          }
        }
      }
      //regular diagonal winnning
      for(let vert = 0; vert < this.board.length-3; vert++) {
        for(let horiz = 0; horiz < 3; horiz++) {
          let temp = this.board[vert][horiz];
          if(temp === this.board[vert+1][horiz+1] && temp === this.board[vert+2][horiz+2]
             && this.board[vert+3][horiz+3]) {
               if(temp === "red") {
                 this.p1.socket.emit('game:winner', { winner: "red" });
                 this.p2.socket.emit('game:winner', { winner: "red" });
                 this.quit_game();
                 this.p1.servermsg_room(`${this.p2.username} beat ${this.p1.username} in connect-4!`);
               }
               else if(temp === "yellow") {
                 this.p1.socket.emit('game:winner', { winner: "yellow" });
                 this.p2.socket.emit('game:winner', { winner: "yellow" });
                 this.quit_game();
                 this.p1.servermsg_room(`${this.p1.username} beat ${this.p2.username} in connect-4!`);
               }
          }
        }
      }
      //backwards diagonal winning
      for(let vert = 0; vert < this.board.length-3; vert++) {
        for(let horiz = 3; horiz < 6; horiz++) {
          let temp = this.board[vert][horiz];
          if(temp === this.board[vert+1][horiz-1] && temp === this.board[vert+2][horiz-2]
             && this.board[vert+3][horiz-3]) {
               if(temp === "red") {
                 this.p1.socket.emit('game:winner', { winner: "red" });
                 this.p2.socket.emit('game:winner', { winner: "red" });
                 this.quit_game();
                 this.p1.servermsg_room(`${this.p2.username} beat ${this.p1.username} in connect-4!`);
               }
               else if(temp === "yellow") {
                 this.p1.socket.emit('game:winner', { winner: "yellow" });
                 this.p2.socket.emit('game:winner', { winner: "yellow" });
                 this.quit_game();
                 this.p1.servermsg_room(`${this.p1.username} beat ${this.p2.username} in connect-4!`);
               }
          }
        }
      }
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
const friends_queue = {};

exports.matchmake_friend = function(user, data){
   var friend = data.username;
   var friend_user = users.from_username(friend);
   if( friends_queue[friend] === user.username ){
      delete friends_queue[friend];
      Game.matchmake(friend_user, user);
      return;
   }
   if( !friend_user )
      console.log("Friend didn't exist");
   else if( friend_user.game )
      console.log("Friend is in a game");
   else {
      friends_queue[user.username] = friend_user.username;
      friend_user.servermsg_private(`User '${user.username}' Invites you to join a game!`);
      user.servermsg_private(`You invited '${friend_user.username}' to join a game!`);
   }
}

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

