var fs = require('fs');
var express = require('express');
var app = express();
var Twig = require("twig");
var server = require('http').createServer(app);



var nbJoueurs = 0;
var joueurs = [];
var numTour = 1;
var quiJoue = 0;
var dominos = [];
var dominosPick = [];

/*
var server = http.createServer(function(req, res) {
    if(nbJoueurs>3){
    	fs.readFile('./vues/non.html', 'utf-8', function(error, content) {
        	res.writeHead(200, {"Content-Type": "text/html"});
        	res.end(content);
    	});
    	console.log("Connexion refusée");
    }
    else{
    	fs.readFile('./vues/vueKDtest.html', 'utf-8', function(error, content) {
        	res.writeHead(200, {"Content-Type": "text/html"});
        	res.end(content);
    	});
    }
}); */

app.use(express.static(__dirname));
app.get('/', function(req, res) {
    res.render(__dirname+'/template/index.html.twig',{message : "hello world"}); //moteur de rendu twig
});

app.get('/jeu', function(req, res) {
  if(nbJoueurs>3){
    res.render(__dirname+'/template/gandalf.html.twig',{erreur : "Le salon est complet "});
  }else {
    res.render(__dirname+'/template/jeu.html.twig');
  }
});


var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

	socket.on('connectionJoueur',function(pseudo) {

    	//console.log("Connexion detectée");
    	nbJoueurs++;
    	//console.log(nbJoueurs);
    	socket.pseudo = pseudo;
	    joueurs.push(pseudo);
	    socket.dominoPick = 0;
	    dominosPick.push(socket.dominoPick);
	    socket.zone = [];
	    for(var i = 0;i<5;i++){
	    	var tabTemp = [];
	    	for(var j = 0;j<5;j++){
	    		var he = 5;
	    		var caseDeBase = {
		    		nbCouronnes: 0,
		    		biome: -1,
		    		valeurDominoAttribue: 0
		    	};
	    		tabTemp.push(caseDeBase);
	    	}
	    	socket.zone.push(tabTemp);
	    }
	    var caseDepart ={
	    	nbCouronnes: 0,
	    	biome: 0,
	    	valeurDominoAttribue: 0
	    };
	    socket.zone[2][2] = caseDepart;
	    //console.log(socket.zone);
	    if(nbJoueurs>3){
	    	shuffle(joueurs);
	        //afficherTousLesJoueurs();
	        //---------- Début de partie ----------//
	  	    for(var i=0;i<48;i++){
	  				dominos[i] = i+1;
	  	    }
	  		shuffle(dominos);
	  		envoiDesNouveauxDominos();
	  	    socket.emit('actuTour',numTour);
	  		socket.broadcast.emit('actuTour',numTour);
	  		socket.emit('tonTour',joueurs[quiJoue]);
	  		socket.broadcast.emit('tonTour',joueurs[quiJoue]);
	    }
    });

    socket.on('choisir',function(idDomino) {
    	console.log(idDomino);
    	var verif = true;
    	for(var i=0;i<4;i++){
    		//if(socket.pseudo!=joueurs[i]){
    			if(idDomino == dominosPick[i]){
    				console.log('Choix invalide');
    				socket.emit('choixInvalide');
    				verif = false;
    			}
    		//}
    	}
    	if(verif==true){
    		console.log('Domino selectionné')
    		socket.emit('selectionDomino',idDomino);
	    	socket.broadcast.emit('selectionDomino',idDomino);
	    	socket.dominoPick = idDomino;
	    	for(var i=0;i<4;i++){
	    		if(socket.pseudo==joueurs[i]){
	    			dominosPick[i] = idDomino;
	    		}
	    	}
			//---------- Cas particulier du premier tour ----------//
			if(numTour==1){
				quiJoue++;
				if(quiJoue>3){
					quiJoue = 0;
				}
				socket.emit('tonTour',joueurs[quiJoue]);
				socket.broadcast.emit('tonTour',joueurs[quiJoue]);
			}
    	}
    	
    });

	socket.on('jouer', function(x,y,rotation,idDomino) {
        var verif = true;
        console.log('Je place le domino');
        if(socket.dominoPick!=0){
        	verif = verifPlacement(x,y,rotation,idDomino);
        	if(verif==true){
        		socket.emit('valide',true);
        		socket.broadcast.emit('placageAutres',x,y,rotation,idDomino);
        	}
        	else{
        		socket.emit('valide',false);
        	}
        	socket.dominoPick = 0;
        }
        if(verif==true){
        	quiJoue++;
	        if(quiJoue>3){
				quiJoue = 0;
				envoiDesNouveauxDominos();
				changementDeTour();
				// ---------- Fin de partie ---------- //
				if(numTour>12){
					/*COMPTAGE DES POINTS
					socket.emit('resultatFinal',?);
					socket.broadcast.emit('resultatFinal',?);*/
					nbJoueurs = 0;
					joueurs = [];
					numTour = 1;
					quiJoue = 0;
					dominos = [];
					dominosPick = [];
				}
	        }
	        socket.emit('tonTour',joueurs[quiJoue]);
	        socket.broadcast.emit('tonTour',joueurs[quiJoue]);
        }   
    });

    function envoiDesNouveauxDominos(){
    	var nouveauxDominos = [];
		for(var i=0;i<4;i++){
			nouveauxDominos[i] = dominos.shift();
		}
		nouveauxDominos.sort();
		console.log(nouveauxDominos);
	    socket.emit('envoyerNouveauxDominos',nouveauxDominos);
	    socket.broadcast.emit('envoyerNouveauxDominos',nouveauxDominos);
    }

    function changementDeTour(){
    	numTour++;
		socket.emit('actuTour',numTour);
		socket.broadcast.emit('actuTour',numTour);
    }

    function shuffle(array) {
	  for (let i = array.length - 1; i > 0; i--) {
	    let j = Math.floor(Math.random() * (i + 1));
	    [array[i], array[j]] = [array[j], array[i]];
	  }
	}

	function verifPlacement(x,y,rotation,idDomino){
		if((x>0)&&(y>0)&&(x<5)&&(y<5)){
			fs.readFileSync('Dominos.json','utf8');
			var case1 = JSON.parse(stockDomino['domino'+idDomino]['case1']);
			var case2 = JSON.parse(stockDomino['domino'+idDomino]['case2']);
			console.log(case1);
			console.log(case2);
			if(verifCases(x,y,case1)==true){
				switch(rotation){
					case 0:
						if(((y-1)>0)&&((y-1)<5)){
							if(verifCases(x,y-1,case2)==true){
								socket.zone[x][y] = case1;
								socket.zone[x][y-1] = case2;
								return true;
							}
						}
						break;

					case 1:
						if(((x+1)>0)&&((x+1)<5)){
							if(verifCases(x+1,y,case2)==true){
								socket.zone[x][y] = case1;
								socket.zone[x+1][y] = case2;
								return true;
							}
						}
						break;

					case 2:
						if(((y+1)>0)&&((y+1)<5)){
							if(verifCases(x,y+1,case2)==true){
								socket.zone[x][y] = case1;
								socket.zone[x][y+1] = case2;
								return true;
							}
						}
						break;

					case 3:
						if(((x-1)>0)&&((x-1)<5)){
							if(verifCases(x,x-1,case2)==true){
								socket.zone[x][y] = case1;
								socket.zone[x-1][y] = case2;
								return true;
							}
						}
						break;
				}
			}
		}
		return false;
	}

	function verifCases(x,y,caseVerif){
		if(socket.zone[x][y]==-1){
			if((y-1)>0){
				if(socket.zone[x][y-1].biome==caseVerif.biome||socket.zone[x][y-1].biome==0){
					return true;
				}
			}
			if((x+1)<5){
				if(socket.zone[x+1][y].biome==caseVerif.biome||socket.zone[x+1][y].biome==0){
					return true;
				}
			}
			if((y+1)<5){
				if(socket.zone[x][y+1].biome==caseVerif.biome||socket.zone[x][y+1].biome==0){
					return true;
				}
			}
			if((x-1)>0){
				if(socket.zone[x-1][y].biome==caseVerif.biome||socket.zone[x-1][y].biome==0){
					return true;
				}
			}
		}
		return false;
	}

	//Fonction de debug
	function afficherTousLesJoueurs(){
		for(var i=0;i<nbJoueurs;i++){
	    	console.log(joueurs[i]);
	    }
	}
});

server.listen(8080);
