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
var zones = [];
var points = []; 

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
    res.render(__dirname+'/template/index.html.twig',{message : "Hello world"}); //moteur de rendu twig
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

    	nbJoueurs++;
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
		    		valeurDominoAttribue: 0,
		    		isCounted: false
		    	};
	    		tabTemp.push(caseDeBase);
	    	}
	    	socket.zone.push(tabTemp);
	    }
	    var caseDepart ={
	    	nbCouronnes: 0,
	    	biome: 0,
	    	valeurDominoAttribue: 0,
	    	isCounted: false
	    };
	    socket.zone[2][2] = caseDepart;
	    //console.log(socket.zone);
	    if(nbJoueurs>3){
	    	shuffle(joueurs);
	    	socket.emit('joueurPresent',joueurs);
	    	socket.broadcast.emit('joueurPresent',joueurs);
	        //afficherTousLesJoueurs();
	        //---------- Début de partie ----------//
	  	    for(var i=0;i<48;i++){
	  				dominos[i] = Number(i)+1;
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
					remaniementDesJoueurs();
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
        var verif = true;
        if(socket.dominoPick!=0){
        	verif = verifPlacement(x,y,rotation,idDomino);
        	if(verif==true){
        		socket.emit('valide',true);
        		socket.broadcast.emit('joueAutreJoueur',infos);
        	}
        	else{
        		socket.emit('valide',false);
        	}
        	verifPlac = false;
        }
        if(verif==true){
        	if(numTour==12){
        		zones.push(socket.zone);
        	}
        	socket.dominoPick = 0;
        	quiJoue++;
	        if(quiJoue>3){
	        	quiJoue = 0;
				// ---------- Fin de partie ---------- //
				if(numTour==11){
					remaniementDesJoueurs();
					changementDeTour();
				}
				else if(numTour==12){
					for(var i=0;i<4;i++){
						points.push(totallyBoardScore(board));
					}
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
				else{		
					remaniementDesJoueurs();
					envoiDesNouveauxDominos();
					changementDeTour();
				}
	        }
	        socket.emit('tonTour',joueurs[quiJoue]);
	        socket.broadcast.emit('tonTour',joueurs[quiJoue]);
        }   
    });

	function totallyBoardScore(board) {
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
	}

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

	function compare(x, y) {
    	return x - y;
	}

    function envoiDesNouveauxDominos(){
    	var nouveauxDominos = [];
		for(var i=0;i<4;i++){
			nouveauxDominos[i] = dominos.shift();
		}
		nouveauxDominos.sort(compare);
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

	function remaniementDesJoueurs(){
		var nouvelOrdre = [];
		for(var i=0;i<4;i++){
			var vMin = 999;
			for(var j=0;j<4;j++){
				if(dominosPick!=undefined){
					if(dominosPick[j]<vMin){
						vMin = dominosPick[j];
					}
				}
			}
			for(var k=0;k<4;k++){
				if(dominosPick[k]==vMin){
					nouvelOrdre.push(joueurs[k]);
					delete dominosPick[k];
				}
			}
		}
		for(var i=0;i<4;i++){
			joueurs[i] = nouvelOrdre[i];
		}
	}

	function verifPlacement(x,y,rotation,idDomino){
		if((x>-1)&&(y>-1)&&(x<5)&&(y<5)){
			var stockDomino = fs.readFileSync('Dominos.json');
			var textDomino = 'domino'+idDomino;
			var dominosParses = JSON.parse(stockDomino);
			var case1 = dominosParses[textDomino]['case1'];
			var case2 = dominosParses[textDomino]['case2'];
			var tabVerif = [];
			console.log(case1);
			console.log(case2);
			tabVerif.push(verifCases(x,y,case1));
			if(tabVerif[0]!=-1){
				switch(rotation){
					case 3:
						if(((Number(y)-1)>-1)&&((Number(y)-1)<5)){
							tabVerif.push(verifCases(x,Number(y)-1,case2));
							if(tabVerif[1]!=-1){
								if(tabVerif[0]==1||tabVerif[1]==1){
									socket.zone[x][y] = case1;
									socket.zone[x][Number(y)-1] = case2;
									//afficherZone();
									return true;
								}
							}
						}
						break;

					case 0:
						if(((Number(x)+1)>-1)&&((Number(x)+1)<5)){
							tabVerif.push(verifCases(Number(x)+1,y,case2));
							if(tabVerif[1]!=-1){
								if(tabVerif[0]==1||tabVerif[1]==1){
									socket.zone[x][y] = case1;
									socket.zone[Number(x)+1][y] = case2;
									//afficherZone();
									return true;
								}
							}
						}
						break;

					case 1:
						if(((Number(y)+1)>-1)&&((Number(y)+1)<5)){
							tabVerif.push(verifCases(x,Number(y)+1,case2));
							if(tabVerif[1]!=-1){
								if(tabVerif[0]==1||tabVerif[1]==1){
									socket.zone[x][y] = case1;
									socket.zone[x][Number(y)+1] = case2;
									//afficherZone();
									return true;
								}
							}
						}
						break;

					case 2:
						if(((Number(x)-1)>-1)&&((Number(x)-1)<5)){
							tabVerif.push(verifCases(Number(x)-1,y,case2));
							if(tabVerif[1]!=-1){
								if(tabVerif[0]==1||tabVerif[1]==1){
									socket.zone[x][y] = case1;
									socket.zone[Number(x)-1][y] = case2;
									//afficherZone();
									return true;
								}
							}
						}
						break;
				}
			}
		}
		return false;
	}

	function verifCases(x,y,caseVerif){
		if(socket.zone[x][y].biome==-1){
			if(verifPlac==true){
				return 1;
			}
			else{
				if((Number(y)-1)>0){
					if(socket.zone[x][Number(y)-1].biome==caseVerif.biome||socket.zone[x][Number(y)-1].biome==0){
						console.log('Cas 1 True');
						verifPlac = true;
						return 1;
					}
				}
				if((Number(x)+1)<5){
					if(socket.zone[Number(x)+1][y].biome==caseVerif.biome||socket.zone[Number(x)+1][y].biome==0){
						console.log('Cas 2 True');
						verifPlac = true;
						return 1;
					}
				}
				if((Number(y)+1)<5){
					if(socket.zone[x][Number(y)+1].biome==caseVerif.biome||socket.zone[x][Number(y)+1].biome==0){
						console.log('Cas 3 True');
						verifPlac = true;
						return 1;
					}
				}
				if((Number(x)-1)>0){
					if(socket.zone[Number(x)-1][y].biome===caseVerif.biome||socket.zone[Number(x)-1][y].biome==0){
						console.log('Cas 4 True');
						verifPlac = true;
						return 1;
					}
				}
			}
			return 2;	
		}
		else{
			return -1;
		}
		
	}

	//Fonction de debug
	function afficherTousLesJoueurs(){
		for(var i=0;i<nbJoueurs;i++){
	    	console.log(joueurs[i]);
	    }
	}

	//Fonction de debug
	function afficherZone(){
		for(var i=0;i<5;i++){
			for(var j=0;j<5;j++){
				console.log(i+" "+j+" : ");
				console.log(socket.zone[i][j]);
			}
		}
	}
});

server.listen(8080);
