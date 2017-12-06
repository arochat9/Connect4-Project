const fs = require("fs");

const user_data = {}

exports.read_users = function(datafile){
   fs.readFileSync(datafile).toString().split('\n').forEach( line => {
      var match = line.match(/^(\w+):(\w+):(\w+(?:,\w+)*|)$/);
      if( !match ){
         console.error(`Invalid line! ${line}`);
         return;
      }
      let [_, username, password, friends] = match;
      user_data[username] = { password, friends };

   });
}
fs.readFileSync('./input.txt').toString().split('\n').forEach(function (line) { 
    console.log(line);
    fs.appendFileSync("./output.txt", line.toString() + "\n");
});
