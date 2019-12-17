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
var verifPlac = false;

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
    		if(idDomino == dominosPick[i]){
    			console.log('Choix invalide');
    			socket.emit('choixInvalide');
    			verif = false;
    		}
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
					envoiDesNouveauxDominos();
					changementDeTour();
				}
				socket.emit('tonTour',joueurs[quiJoue]);
				socket.broadcast.emit('tonTour',joueurs[quiJoue]);
			}
    	}
    	
    });

	socket.on('jouer', function(infos) {
		var x = infos.x;
		var y = infos.y;
		var rotation = infos.o;
		var idDomino = infos.id;
		var jou = infos.joueur;
        var verif = true;
        console.log('Je passe dans jouer');
        if(socket.dominoPick!=0){
        	verif = verifPlacement(x,y,rotation,idDomino);
        	if(verif==true){
        		console.log('Placement ok !');
        		socket.emit('valide',true);
        		socket.broadcast.emit('joueAutreJoueur',infos);
        	}
        	else{
        		socket.emit('valide',false);
        	}
        	socket.dominoPick = 0;
        }
        if(verif==true){
        	verifPlac = false;
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

	/*function tallyBoardScore(board) {
	            let total = 0;
	            for (let i = 0; i < 5; i++) {
	                for (let j = 0; j < 5; j++) {
		                var count = 0;
		                var nbCouronnes = 0;
	                  	var actualBiome = board[i][j].biome;
	                  	if (!board[i][j].isCounted && board[i][j].biome !== 0) checkPiece(i,j);
	                  	console.log('A');
	                	console.log('Count : ',count,', NbCouronnes : ', nbCouronnes);
	                	total += (count * nbCouronnes);
	                }
	            }
	            return total;

	function checkPiece(num,num2) {
	                 	board[num][num2].isCounted = true;
	                  	count += 1;
	                  	nbCouronnes += board[num][num2].nbCouronnes;
	                  	console.log('Cas 10, Co :',num+1,num2+1);
	                  	//Down
	                    if (num+1<5 && !board[num+1][num2].isCounted) {
	                    	if (board[num+1][num2].biome === board[num][num2].biome) {
	                      		console.log('Cas 1, Co :',num+2,num2+1);
	                      		checkPiece(num+1,num2);
	                   		}
	                    }
	                  	//Up
	                  	if (num-1>=0 && !board[num-1][num2].isCounted) {
	                    	if (board[num-1][num2].biome === board[num][num2].biome) {
	                    		console.log('Cas 2, Co :',num,num2+1);
	                    	  	checkPiece(num-1,num2);
	                    	}
	                  	}
	                    //Left
	                    if (num2-1>=0 && !board[num][num2-1].isCounted) {
	                    	if (board[num][num2-1].biome === board[num][num2].biome) {
	                      		console.log('Cas 3, Co :',num+1,num2);
	                      		checkPiece(num,num2-1);
	                    	}
	                  	}
	                  	//Right
	                  	if (num2+1<5 && !board[num][num2+1].isCounted) {
	                    	if (board[num][num2+1].biome === board[num][num2].biome) {
	                      		console.log('Cas 4, Co :',num+1,num2+2);
	                      		checkPiece(num,num2+1);
	                    	}
	                    }
	}
	}*/
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
		/*console.log('Je passe dans verifPlacement');
		console.log('-------------');
		console.log(x);
		console.log(y);
		console.log(rotation);
		console.log(idDomino);
		console.log('-------------');*/
		if((x>0)&&(y>0)&&(x<5)&&(y<5)){
			var stockDomino = fs.readFileSync('Dominos.json');
			var textDomino = 'domino'+idDomino;
			var dominosParses = JSON.parse(stockDomino);
			var case1 = dominosParses[textDomino]['case1'];
			var case2 = dominosParses[textDomino]['case2'];
			console.log(case1);
			console.log(case2);
			if(verifCases(x,y,case1)!=-1){
				switch(rotation){
					case 3:
						if(((Number(y)-1)>0)&&((Number(y)-1)<5)){
							if(verifCases(x,Number(y)-1,case2)!=-1){
								socket.zone[x][y] = case1;
								socket.zone[x][Number(y)-1] = case2;
							}
						}
						break;

					case 0:
						if(((Number(x)+1)>0)&&((Number(x)+1)<5)){
							if(verifCases(Number(x)+1,y,case2)!=-1){
								socket.zone[x][y] = case1;
								socket.zone[Number(x)+1][y] = case2;
							}
						}
						break;

					case 1:
						if(((Number(y)+1)>0)&&((Number(y)+1)<5)){
							if(verifCases(x,Number(y)+1,case2)!=-1){
								socket.zone[x][y] = case1;
								socket.zone[x][Number(y)+1] = case2;
							}
						}
						break;

					case 2:
						if(((Number(x)-1)>0)&&((Number(x)-1)<5)){
							if(verifCases(Number(x)-1,y,case2)!=-1){
								socket.zone[x][y] = case1;
								socket.zone[Number(x)-1][y] = case2;
							}
						}
						break;
				}
			}
			for(var i=0;i<5;i++){
				for(var j=0;j<5;j++){
					console.log(i+" "+j+" : ");
					console.log(socket.zone[i][j]);
				}
			}
		}
		return false;
	}

	function verifCases(x,y,caseVerif){
		console.log('Je passe dans verifCases');
		console.log(socket.zone[x][y].biome);
		if(socket.zone[x][y].biome==-1){
			console.log('I am a joke to you ?');
			/*console.log('Le premier test de verifCases est OK.');
			console.log(x);
			console.log(y);
			console.log(caseVerif.biome);
			for(var i=0;i<5;i++){
				for(var j=0;j<5;j++){
					console.log(i+" "+j+" : ");
					console.log(socket.zone[i][j]);
				}
			}
			console.log((Number(x)+1));
			console.log((Number(y)+1));
			console.log(socket.zone[x][Number(y)-1].biome);
			console.log(socket.zone[Number(x)+1][y].biome);
			console.log(socket.zone[x][Number(y)+1].biome);
			console.log(socket.zone[Number(x)-1][y].biome);*/
			if(verifPlac==true){
				return 1;
			}
			else{
				if((Number(y)-1)>0){
					if(socket.zone[x][Number(y)-1].biome==caseVerif.biome||socket.zone[x][Number(y)-1].biome==0){
						console.log('Cas 1 True');
						verifPlac = true;
						return 2;
					}
				}
				if((Number(x)+1)<5){
					if(socket.zone[Number(x)+1][y].biome==caseVerif.biome||socket.zone[Number(x)+1][y].biome==0){
						console.log('Cas 2 True');
						verifPlac = true;
						return 2;
					}
				}
				if((Number(y)+1)<5){
					if(socket.zone[x][Number(y)+1].biome==caseVerif.biome||socket.zone[x][Number(y)+1].biome==0){
						console.log('Cas 3 True');
						verifPlac = true;
						return 2;
					}
				}
				if((Number(x)-1)>0){
					if(socket.zone[Number(x)-1][y].biome===caseVerif.biome||socket.zone[Number(x)-1][y].biome==0){
						console.log('Cas 4 True');
						verifPlac = true;
						return 2;
					}
				}
			}	
		}
		return -1;
	}

	//Fonction de debug
	function afficherTousLesJoueurs(){
		for(var i=0;i<nbJoueurs;i++){
	    	console.log(joueurs[i]);
	    }
	}
});

server.listen(8080);
