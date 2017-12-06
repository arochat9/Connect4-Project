const PORT = 3456;
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const app = http.createServer(function(req, resp){
   var file_to_serve = 'client';
   if( req.url[0] === '/' && (req.url.endsWith(".js") || req.url.endsWith('.css')))
      file_to_serve += req.url;
   else
      file_to_serve += '/client.html';


   fs.readFile(file_to_serve, function(err, data){
      if(err){
         console.error(`Couldn't send '${file_to_serve}': ${err}.`)
         return resp.writeHead(500);
      }
      resp.writeHead(200);
      resp.end(data);
   });
});


app.listen(PORT);

const io = socketio.listen(app);
module.exports = { app, io, socketio };
