var fs = require('fs');
var express = require('express');
var app = express();
var Twig = require("twig");

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname));
app.get('/', function(req, res) {
    res.render(__dirname+'/template/index.html.twig',{message : "hello world"}); //moteur de rendu twig
});

app.get('/jeu', function(req, res) {
    res.render(__dirname+'/template/jeu.html.twig');
});

io.sockets.on('connection', function (socket) {
  
}





server.listen(8080);
