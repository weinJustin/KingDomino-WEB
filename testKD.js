var fs = require('fs');
var express = require('express');
var app = express();
var Twig = require("twig");
var server = require('http').createServer(app);



var nbJoueurs = 0; //Le nombre de joueurs
var joueurs = []; //Stocke les pseudos des joueurs
var numTour = 1; //Le numéro du tour actuel
var quiJoue = 0; //Détermine qui est/sera en train de joueur
var dominos = []; //Stocke les dominos qui seront envoyés par la suite
var dominosPick = []; //Sert à garder en mémoire les dominos choisis par les joueurs
var zones = []; //Stocke les zones des joueurs, des tableaux à 2 dimensions de Cases.
var points = []; //Stocke les points des différents joueurs, utilisé uniquement en fin de partie
var verifPlac = false; //Déclaré ici par besoin d'une variable globale

var fin = false; //Variable temporaire servant à forcer la fin d'une partie

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

//Gestion de l'entrée dans le jeu
app.get('/jeu', function(req, res) {
  if(nbJoueurs>3){
    res.render(__dirname+'/template/gandalf.html.twig',{erreur : "Le salon est complet "});
  }else {
    res.render(__dirname+'/template/jeu.html.twig');
  }
});


var io = require('socket.io').listen(server);

//Bienevenue dans le coeur du serveur
io.sockets.on('connection', function (socket) {

	//Les évenements se produisant lors de la connexion d'un joueur
	socket.on('connectionJoueur',function(pseudo) {
    	nbJoueurs++;
    	socket.pseudo = pseudo;
	    joueurs.push(pseudo);
	    socket.dominoPick = 0;
	    dominosPick.push(socket.dominoPick);
	    //----- Initialisation de la zone -----//
	    socket.zone = [];
	    for(var i = 0;i<5;i++){
	    	var tabTemp = [];
	    	for(var j = 0;j<5;j++){
	    		var caseDeBase = {
		    		nbCouronnes: 0,
		    		biome: -1,
		    		valeurDominoAttribue: 0,
		    		isCounted: false
		    	};
	    		tabTemp[j] = caseDeBase;
	    	}
	    	socket.zone.push(tabTemp);
	    }
	    var caseDepart = {
	    	nbCouronnes: 0,
	    	biome: 0,
	    	valeurDominoAttribue: 0,
	    	isCounted: false
	    };
	    socket.zone[2][2] = caseDepart;
	    zones.push(socket.zone);
	    afficherZone(socket.zone);
	    //----- Fin de l'initialisation de la zone -----//
	    //console.log(socket.zone);
	    if(nbJoueurs>3){
	    	shuffle(joueurs);
	    	socket.emit('joueurPresent',joueurs);
	    	socket.broadcast.emit('joueurPresent',joueurs);
	        //afficherTousLesJoueurs();
	        //----- Début de partie -----//
	        // Initialisation des identifiants des dominos
	  	    for(var i=0;i<48;i++){
	  				dominos[i] = Number(i)+1;
	  	    }
	  		shuffle(dominos); //On mélange les identifiants des dominos
	  		envoiDesNouveauxDominos(); //On envoie les premiers dominos
	  	    socket.emit('actuTour',numTour);
	  		socket.broadcast.emit('actuTour',numTour);
	  		socket.emit('tonTour',joueurs[quiJoue]);
	  		socket.broadcast.emit('tonTour',joueurs[quiJoue]);
	    }
    });

	//Gère la sélection du domino
    socket.on('choisir',function(idDomino) {
    	//console.log(idDomino);
    	var verif = true;
    	//On vérifie si le domino selectionné n'a pas déjà été choisi par un autre joueur
    	for(var i=0;i<4;i++){
    		if(idDomino == dominosPick[i]){
    			//console.log('Choix invalide');
    			socket.emit('choixInvalide');
    			verif = false;
    		}
    	}
    	if(verif==true){
    		//console.log('Domino selectionné')
    		socket.emit('selectionDomino',idDomino);
	    	socket.broadcast.emit('selectionDomino',idDomino);
	    	socket.dominoPick = idDomino;
	    	//On stocke le domino selectionné dans dominoPick[], qui sera utilisé plus tard
	    	for(var i=0;i<4;i++){
	    		if(socket.pseudo==joueurs[i]){
	    			dominosPick[i] = idDomino;
	    		}
	    	}
			//---------- Cas particulier du premier tour ----------//
			//Le premier tour se termine une fois que les joueurs ont choisi leur domino
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

    //Gère l'étape de placement du domino
	socket.on('jouer', function(infos) {
		//On reçoit les différentes informations du domino par l'interface
		var x = infos.x;
		var y = infos.y;
		var rotation = infos.o;
		var idDomino = infos.id;
        var verif = true;
        //On vérifie le placement du domino, 0 correspond à un domino défaussé
        if(socket.dominoPick!=0){
        	verif = verifPlacement(x,y,rotation,idDomino);
        	if(verif==true){
        		socket.emit('valide',true); //Le domino sera placé sur l'interface 
        		socket.broadcast.emit('joueAutreJoueur',infos); //Le domino placé sera vissible sur l'écran des autres joueurs
        	}
        	else{
        		socket.emit('valide',false);
        	}
        	verifPlac = false;
        }
        if(verif==true){
        	if(fin==true){
        		//TEMPORAIRE
        		for(var i=0;i<4;i++){
        			afficherZone(zones[i]);
        		}
        		finDePartie();
        	}
        	socket.dominoPick = 0;
        	quiJoue++;
	        if(quiJoue>3){
	        	quiJoue = 0;
				// ---------- Fin de partie ---------- //
				//Il n'y a plus de nouveaux dominos à envoyer au tour 11
				if(numTour==11){
					remaniementDesJoueurs();
					changementDeTour();
				}
				else if(numTour==12){
					finDePartie();
					//Gestion de l'envoi des résultats à COMPLETER
					/*socket.emit('resultatFinal',?);
					socket.broadcast.emit('resultatFinal',?);*/
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

    //Temporaire, force la partie à se terminer
    socket.on('finDePartie', function(){
    	fin = true;
    });

    //Fonction servant à calculer le score total
	function totallyBoardScore(board) {
	    let total = 0;
	    for (let i = 0; i < 4 ; i++) {
	        for (let j = 0; j < 5; j++) {
		        var count = 0;
		        var nbCouronnes = 0;
	            var actualBiome = board[i][j].biome;
	            if (!board[i][j].isCounted && board[i][j].biome !== 0) checkPiece(i,j);
	            console.log(i,j);
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
	}

	function compare(x, y) {
    	return x - y;
	}

    function envoiDesNouveauxDominos(){
    	var nouveauxDominos = [];
    	//Retire 4 dominos du tableau dominos[]
		for(var i=0;i<4;i++){
			nouveauxDominos[i] = dominos.shift();
		}
		nouveauxDominos.sort(compare); //Trie les domino par ordre croissant
		//console.log(nouveauxDominos);
	    socket.emit('envoyerNouveauxDominos',nouveauxDominos);
	    socket.broadcast.emit('envoyerNouveauxDominos',nouveauxDominos);
    }

    function changementDeTour(){
    	numTour++;
		socket.emit('actuTour',numTour);
		socket.broadcast.emit('actuTour',numTour);
    }

    //Utilisé au début de partie pour mélanger le tableau dominos[]
    function shuffle(array) {
	  for (let i = array.length - 1; i > 0; i--) {
	    let j = Math.floor(Math.random() * (i + 1));
	    [array[i], array[j]] = [array[j], array[i]];
	  }
	}

	//Remanie l'ordre de passage des joueurs,
	//Le joueur ayant choisi le domino le plus faible choisit son prochain domino en premier, et ainsi de suite
	function remaniementDesJoueurs(){
		var nouvelOrdre = [];
		var nouvelOrdreZones = [];
		for(var i=0;i<4;i++){
			var vMin = 999;
			for(var j=0;j<4;j++){
				if(dominosPick[j]!=undefined){ //L'utilisation de "delete" peut engendrer des "undefined"
					if(dominosPick[j]<vMin){
						vMin = dominosPick[j];
					}
				}
			}
			for(var k=0;k<4;k++){
				if(dominosPick[k]==vMin){
					nouvelOrdre.push(joueurs[k]);
					nouvelOrdreZones.push(zones[k]);
					delete dominosPick[k];
				}
			}
		}
		for(var i=0;i<4;i++){
			joueurs[i] = nouvelOrdre[i];
			zones[k] = nouvelOrdreZones[i];
		}
		for(var i=0;i<4;i++){
			afficherZone(zones[i]);
		}
	}

	function verifPlacement(x,y,rotation,idDomino){
		//On vérifie si le domino ne dépasse pas de la zone
		if((x>-1)&&(y>-1)&&(x<5)&&(y<5)){
			//----- Lecture des dominos danss le fichier Dominos.json -----//
			var stockDomino = fs.readFileSync('Dominos.json');
			var textDomino = 'domino'+idDomino;
			var dominosParses = JSON.parse(stockDomino);
			var case1 = dominosParses[textDomino]['case1'];
			var case2 = dominosParses[textDomino]['case2'];
			//----- Fin de la lecture des dominos danss le fichier Dominos.json -----//
			var tabVerif = [];
			//console.log(case1);
			//console.log(case2);
			tabVerif.push(verifCases(x,y,case1));
			//Si la premiere case ne chevauche pas une autre case non-vide, on continue
			if(tabVerif[0]!=-1){
				switch(rotation){
					//Rotation : Haut
					case 3:
						if(((Number(y)-1)>-1)&&((Number(y)-1)<5)){
							tabVerif.push(verifCases(x,Number(y)-1,case2));
							//Si la deuxième case ne chevauche pas une autre case non-vide, on continue
							if(tabVerif[1]!=-1){
								//Si un des deux dominos est adjacent à un autre domino valide (ou à la case de départ), on continue
								if(tabVerif[0]==1||tabVerif[1]==1){
									//SI CETTE DERNIERE CONDITION EST VALIDE, LE PLACEMENT DU DOMINO EST VALIDE AUSSI
									//"Prise en note" des modification effectuées sur la zone du joueur en plaçant le nouveau domino
									socket.zone[x][y] = case1;
									socket.zone[x][Number(y)-1] = case2;
									//afficherZone();
									return true;
								}
							}
						}
						break;
					//Rotation : Gauche
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
					//Rotation : Bas
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
					//Rotation : Droite
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

	//Appelée par verifPlacement, vérifie le non-chevauchement et l'adjacence
	function verifCases(x,y,caseVerif){
		//On vérifie que la case ne chevauche pas une autre case non-vide
		if(socket.zone[x][y].biome==-1){
			if(verifPlac==true){
				return 1;
			}
			else{
				//On vérifie l'adjacence, c'est à dire que l'on regarde si il y a une case à côté, et si oui, quel est son biome
				//".biome == 0" (Case de départ)
				if((Number(y)-1)>0){
					if(socket.zone[x][Number(y)-1].biome==caseVerif.biome||socket.zone[x][Number(y)-1].biome==0){
						verifPlac = true;
						return 1;
					}
				}
				if((Number(x)+1)<5){
					if(socket.zone[Number(x)+1][y].biome==caseVerif.biome||socket.zone[Number(x)+1][y].biome==0){
						verifPlac = true;
						return 1;
					}
				}
				if((Number(y)+1)<5){
					if(socket.zone[x][Number(y)+1].biome==caseVerif.biome||socket.zone[x][Number(y)+1].biome==0){
						verifPlac = true;
						return 1;
					}
				}
				if((Number(x)-1)>0){
					if(socket.zone[Number(x)-1][y].biome===caseVerif.biome||socket.zone[Number(x)-1][y].biome==0){
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

	//Gère les évenements liés à la fin de partie, encore en TEST
	function finDePartie(){
		for(var i=0;i<4;i++){
			points.push(totallyBoardScore(zones[i]));
		}
		var ordreGagnant = [];
		var ordrePoints = [];
		for(var i=0;i<4;i++){
			var vMax = -1;
			for(var j=0;j<4;j++){
				if(points[j]!=undefined){
					if(points[j]>vMax){
						vMax = points[j];
					}
				}
			}
			for(var k=0;k<4;k++){
				if(points[k]==vMax){
					ordreGagnant.push(joueurs[k]);
					ordrePoints.push(points[k])
					delete points[k];
				}
			}
		}
		console.log("-w-w-w-w-w-w-w-w-");
		for(var i=0;i<4;i++){
			console.log(ordreGagnant[i]+" : "+ordrePoints[i]+"pts.");
		}
		console.log("Partie Terminée")
	}

	//Fonction de debug
	function afficherTousLesJoueurs(){
		for(var i=0;i<nbJoueurs;i++){
	    	console.log(joueurs[i]);
	    }
	}

	//Fonction de debug
	function afficherZone(zone){
		console.log("*--------------*");
		for(var i=0;i<1;i++){
			for(var j=0;j<5;j++){
				console.log(zone[i][j].biome+""+""+zone[i+1][j].biome+""+""+zone[i+2][j].biome+""+""+zone[i+3][j].biome+""+""+zone[i+4][j].biome);
			}
		}
	}
});

server.listen(8080);
