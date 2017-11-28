const PORT = 3456;
const http = require('http');
const fs = require('fs');

/******************************************************************************/

const app = http.createServer(function(req, resp){
   var file_to_serve;
   if(req.url === '/client.css')
      file_to_serve = 'client.css';
   else
      file_to_serve = 'client.html';

   fs.readFile(file_to_serve, function(err, data){
      if(err)
         return resp.writeHead(500);
      resp.writeHead(200);
      resp.end(data);
   });
});


app.listen(PORT);

module.exports = app;