var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);

var port = process.env.PORT || 1337;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));
