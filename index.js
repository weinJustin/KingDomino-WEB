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
joueur = ["koda","Samael","Amenadiel"]
io.sockets.on('connection', function (socket) {
  socket.emit('envoyerNouveauxDominos',[1,2,3,4]);
  socket.on('connectionJoueur',function(nom){
    joueur.push(nom);
    socket.emit('envoyerNouveauxDominos',[5,6,7,8]);
    socket.broadcast.emit('joueurPresent',joueur);
    socket.emit('joueurPresent',joueur)
  });


});





server.listen(8080);
