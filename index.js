var fs = require('fs');
var express = require('express');
var app = express();
var Twig = require("twig");
var http = require('http');
var server = require('http').createServer(app);

var salons = [] //On stocke toutes les variables par salons

var nombreSalons = 5;

for(var i = 0; i <nombreSalons; i++) { //on génére des instances de salon
  salons.push({
    dominos : [], //Stocke les dominos qui seront envoyés par la suite
    dominosActuels : [], //Stocke les dominos à chosir au tour actuel
    dominosPick : [], //Sert à garder en mémoire les dominos choisis par les joueurs
    dominosPickOrdis : [0,0,0,0], //Sert à garder en mémoire les dominos choisis par les ordis
    joueurs : [], //Stocke les pseudos des joueurs
    identite : [[],[]], //Permet de savoir si un pseudonyme correspond à un joueur ou à un ordi
    nbJoueurs : 0, //Le nombre de joueurs
    nbOrdis : 0, //Le nombre d'ordis
    numTour : 1, //Le numéro du tour actuel
    points : [], //Stocke les points des différents joueurs, utilisé uniquement en fin de partie
    quiJoue : 0, //Détermine qui est/sera en train de jouer
    verifPlac : false, //Déclaré ici par besoin d'une variable globale
    zones : [], //Stocke les zones des joueurs, des tableaux à 2 dimensions de Cases.
    stockDomino : "", //Le contenu du fichier contenant les dominos et leurs attributs
    partieCommencee : false,
    partieTerminee : false,
    attendre : false
  })
}

app.use(express.static(__dirname));
app.get('/', function(req, res) {
    retour = []
    for (var x in salons) {
      if (salons[x].nbJoueurs<4) {
        retour.push({num:x,place:salons[x].nbJoueurs})
      }
    }
    res.render(__dirname+'/template/index.html.twig',{salons:retour}); //moteur de rendu twig
});

//Gestion de l'entrée dans le jeu
app.get('/jeu/:id', function(req, res) {
  if(salons[Number(req.param("id"))].nbJoueurs>3){
    res.render(__dirname+'/template/gandalf.html.twig',{erreur : "Le salon est complet "});
  }else {
    res.render(__dirname+'/template/jeu.html.twig');
  }
});

var io = require('socket.io').listen(server);

//Bienevenue dans le coeur du serveur
io.sockets.on('connection', function (socket) {

	socket.on('message', function (message) {
        console.log('Un client me parle ! Il me dit : ' + message);
        nombreSalons++;
        salons.push({
		    dominos : [], //Stocke les dominos qui seront envoyés par la suite
		    dominosActuels : [], //Stocke les dominos à chosir au tour actuel
		    dominosPick : [], //Sert à garder en mémoire les dominos choisis par les joueurs
		    dominosPickOrdis : [0,0,0,0], //Sert à garder en mémoire les dominos choisis par les ordis
		    joueurs : [], //Stocke les pseudos des joueurs
		    identite : [[],[]], //Permet de savoir si un pseudonyme correspond à un joueur ou à un ordi
		    nbJoueurs : 0, //Le nombre de joueurs
		    nbOrdis : 0, //Le nombre d'ordis
		    numTour : 1, //Le numéro du tour actuel
		    points : [], //Stocke les points des différents joueurs, utilisé uniquement en fin de partie
		    quiJoue : 0, //Détermine qui est/sera en train de jouer
		    verifPlac : false, //Déclaré ici par besoin d'une variable globale
		    zones : [], //Stocke les zones des joueurs, des tableaux à 2 dimensions de Cases.
		    stockDomino : "", //Le contenu du fichier contenant les dominos et leurs attributs
		    partieCommencee : false
  		})
    });

    socket.on('defausse', function(idDomino){
     socket.broadcast.emit('defausse',idDomino)
		salons[socket.salon].quiJoue++;
		if(salons[socket.salon].quiJoue>3){
			gestionEnFonctionDuTour(socket.salon);
		}
		while(verifIdentite(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue])=="ordi"){
			choixOrdi(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
			salons[socket.salon].quiJoue++;
			if(salons[socket.salon].quiJoue>3){
				gestionEnFonctionDuTour(socket.salon);
			}
		}
		socket.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
		socket.broadcast.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
	});

	socket.on('deconnexion', function(data){
        // ajouter une sécurité pour que les autres joueurs puissent jouer
        //console.log(salons[data]);
        var pos = salons[data].joueurs.indexOf(socket.pseudo);
        if(!salons[data].partieTerminee){
        	if(salons[data].partieCommencee){
	            salons[data].joueurs.splice(pos,1);
	            salons[data].nbOrdis++;
	            salons[data].identite[0][pos] = 'ordi'+salons[data].nbOrdis;
	            salons[data].identite[1][pos] = 'ordi';
	            creerOrdi(data);
	            return;
	        }
	        if (salons[data].nbJoueurs < 4 && salons[data].nbJoueurs > 0) {
	            salons[data].joueurs.splice(pos,1);
	            salons[data].identite[0].splice(pos,1);
	            salons[data].identite[1].splice(pos,1);
	            salons[data].nbJoueurs--;
	            return
	        }
	        if (salons[data].nbJoueurs == 4) {
	         	partieCommencée = true;
	            salons[data].joueurs.splice(pos,1);
	            salons[data].nbJoueurs--;
	            creerOrdi(data);
	            return
	        }
        }
    });

	//Les évenements se produisant lors de la connexion d'un joueur
	socket.on('connectionJoueur',function(data){
    	socket.pseudo = data.pseudo;
      	socket.salon = Number(data.salon);
      	salons[data.salon].nbJoueurs++;
	    salons[data.salon].joueurs.push(data.pseudo);
	    salons[data.salon].identite[0].push(data.pseudo);
	    salons[data.salon].identite[1].push("joueur");
	    salons[data.salon].dominosPick.push(0);
	    //----- Initialisation de la zone -----//
	    var zone = [];
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
	    	zone.push(tabTemp);
	    }
	    var caseDepart = {
	    	nbCouronnes: 0,
	    	biome: 0,
	    	valeurDominoAttribue: 0,
	    	isCounted: false
	    };
	    zone[2][2] = caseDepart;
	    salons[socket.salon].zones.push(zone);
      	// console.log(salons);
	    // afficherZone(socket.zone,socket.salon);
	    //----- Fin de l'initialisation de la zone -----//
	    //console.log(socket.zone);
	    if(salons[socket.salon].nbJoueurs>3){
	    	salons[socket.salon].stockDomino = fs.readFileSync('Dominos.json');
	    	//creerOrdi(socket.salon);
	    	//creerOrdi(socket.salon);
	    	shuffleDoubleArray(salons[socket.salon].joueurs,salons[socket.salon].zones);
	    	socket.emit('joueurPresent',salons[socket.salon].joueurs);
	    	socket.broadcast.emit('joueurPresent',salons[socket.salon].joueurs);
	        //afficherTousLesJoueurs();
	        //----- Début de partie -----//
	        // Initialisation des identifiants des dominos
	  	    for(var i=0;i<48;i++){
	  			salons[socket.salon].dominos[i] = Number(i)+1;
	  	    }
	  		shuffle(salons[socket.salon].dominos); //On mélange les identifiants des dominos
	  		envoiDesNouveauxDominos(socket.salon); //On envoie les premiers dominos
	  	  	socket.emit('actuTour',salons[socket.salon].numTour);
	  		socket.broadcast.emit('actuTour',salons[socket.salon].numTour);
	  		afficherIdentites(socket.salon);
		  	while(verifIdentite(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue])=="ordi"){
		  		choixOrdi(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
		  		salons[socket.salon].quiJoue++;
		  		if(salons[socket.salon].quiJoue>3){
			  		gestionEnFonctionDuTour(socket.salon);
		  		}
		  	}
		  	socket.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
			socket.broadcast.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
	    }
    });

	//Gère la sélection du domino
    socket.on('choisir',function(idDomino) {
    	var verif = true;
    	//On vérifie si le domino selectionné n'a pas déjà été choisi par un autre joueur
    	for(var i=0;i<4;i++){
    		if(idDomino == salons[socket.salon].dominosPick[i]){
    			//console.log('Choix invalide');
    			socket.emit('choixInvalide');
    			verif = false;
    		}
    	}
    	if(verif==true){
    		//console.log('Domino selectionné')
    		socket.emit('selectionDomino',{idDomino:idDomino,joueur:salons[socket.salon].joueurs[salons[socket.salon].quiJoue]});
	    	socket.broadcast.emit('selectionDomino',{idDomino:idDomino,joueur:salons[socket.salon].joueurs[salons[socket.salon].quiJoue]});
	    	//On stocke le domino selectionné dans dominoPick[], qui sera utilisé plus tard
	    	salons[socket.salon].dominosPick[salons[socket.salon].quiJoue] = idDomino;
			//---------- Cas particulier du premier tour ----------//
			//Le premier tour se termine une fois que les joueurs ont choisi leur domino
			if(salons[socket.salon].numTour==1){
				salons[socket.salon].quiJoue++;
				if(salons[socket.salon].quiJoue>3){
					gestionEnFonctionDuTour(socket.salon);
				}
			  	while(verifIdentite(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue])=="ordi"){
			  		choixOrdi(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
			  		salons[socket.salon].quiJoue++;
			  		if(salons[socket.salon].quiJoue>3){
				  		gestionEnFonctionDuTour(socket.salon);
			  		}
			  	}
			  	socket.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
			 	socket.broadcast.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
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
        if(salons[socket.salon].dominosPick[salons[socket.salon].quiJoue]!=0){
        	verif = verifPlacement(x,y,rotation,idDomino,socket.salon,salons[socket.salon].zones[salons[socket.salon].quiJoue],false);
        	if(verif==true){
        		socket.emit('valide',true); //Le domino sera placé sur l'interface
        		socket.broadcast.emit('joueAutreJoueur',infos); //Le domino placé sera visible sur l'écran des autres joueurs
        	}
        	else{
        		socket.emit('valide',false);
        	}
        	salons[socket.salon].verifPlac = false;
        }
        if(verif==true){
        	//salons[socket.salon].dominosPick[salons[socket.salon].quiJoue] = 0;
        	salons[socket.salon].quiJoue++;
	        if(salons[socket.salon].quiJoue>3){
	        	gestionEnFonctionDuTour(socket.salon);
	        }
		  	while(verifIdentite(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue])=="ordi"){
		  		choixOrdi(socket.salon,salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
		  		salons[socket.salon].quiJoue++;
		  		if(salons[socket.salon].quiJoue>3){
			  		gestionEnFonctionDuTour(socket.salon);
		  		}
		  	}
		  	socket.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
		 	socket.broadcast.emit('tonTour',salons[socket.salon].joueurs[salons[socket.salon].quiJoue]);
        }
    });

    function gestionEnFonctionDuTour(idSalon){
    	salons[idSalon].quiJoue = 0;
		// ---------- Fin de partie ---------- //
		//Il n'y a plus de nouveaux dominos à envoyer au tour 12
		if(salons[idSalon].numTour==12){
			remaniementDesJoueurs(idSalon);
			var vide = [];
			socket.emit('envoyerNouveauxDominos');
	    	socket.broadcast.emit('envoyerNouveauxDominos');
			changementDeTour(idSalon);
		}
		else if(salons[idSalon].numTour==13){
			var result = finDePartie(idSalon);
			//Gestion de l'envoi des résultats à COMPLETER
			socket.emit('resultatFinal',result);
			socket.broadcast.emit('resultatFinal',result);
		}
		else{
			remaniementDesJoueurs(idSalon);
			envoiDesNouveauxDominos(idSalon);
			changementDeTour(idSalon);
		}
    }

    //Fonction servant à calculer le score total
	function totallyBoardScore(board) {
	    let total = 0;
	    for (let i = 0; i < 5 ; i++) {
	        for (let j = 0; j < 5; j++) {
		        var count = 0;
		        var nbCouronnes = 0;
	            var actualBiome = board[i][j].biome;
	            if (!board[i][j].isCounted && board[i][j].biome !== 0) checkPiece(i,j);
	            //console.log(i,j);
	            //console.log('Count : ',count,', NbCouronnes : ', nbCouronnes);
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
		            //console.log('Cas 1, Co :',num+2,num2+1);
		            checkPiece(num+1,num2);
		        }
		    }
		    //Up
		    if (num-1>=0 && !board[num-1][num2].isCounted) {
		        if (board[num-1][num2].biome === board[num][num2].biome) {
		            //console.log('Cas 2, Co :',num,num2+1);
		            checkPiece(num-1,num2);
		        }
		    }
		    //Left
		    if (num2-1>=0 && !board[num][num2-1].isCounted) {
		        if (board[num][num2-1].biome === board[num][num2].biome) {
		            //console.log('Cas 3, Co :',num+1,num2);
		            checkPiece(num,num2-1);
		        }
		    }
		    //Right
		    if (num2+1<5 && !board[num][num2+1].isCounted) {
		        if (board[num][num2+1].biome === board[num][num2].biome) {
		            //console.log('Cas 4, Co :',num+1,num2+2);
		            checkPiece(num,num2+1);
		        }
		    }
		}
	}

	function compare(x, y) {
    	return x - y;
	}

    function envoiDesNouveauxDominos(idSalon){
    	var nouveauxDominos = [];
    	//Retire 4 dominos du tableau dominos[]
		for(var i=0;i<4;i++){
			nouveauxDominos[i] = salons[idSalon].dominos.shift();
		}
		nouveauxDominos.sort(compare); //Trie les domino par ordre croissant
		//console.log(nouveauxDominos);
	    socket.emit('envoyerNouveauxDominos',nouveauxDominos);
	    socket.broadcast.emit('envoyerNouveauxDominos',nouveauxDominos);
	    salons[idSalon].dominosActuels = nouveauxDominos;
	    //afficherDominosActuels(salons[idSalon].dominosActuels);
    }

    function changementDeTour(idSalon){
      	salons[idSalon].numTour++;
  		socket.emit('actuTour',salons[idSalon].numTour);
  		socket.broadcast.emit('actuTour',salons[idSalon].numTour);
    }

    //Utilisé au début de partie pour mélanger le tableau dominos[]
    function shuffle(array){
	  for (let i = array.length - 1; i > 0; i--) {
	    let j = Math.floor(Math.random() * (i + 1));
	    [array[i], array[j]] = [array[j], array[i]];
	  }
	}

	//Utilisé au début de partie pour mélanger les joueurs mais garder leur zone correspondante.
    function shuffleDoubleArray(array1,array2){
	  for (let i = array1.length - 1; i > 0; i--) {
	    let j = Math.floor(Math.random() * (i + 1));
	    [array1[i], array1[j]] = [array1[j], array1[i]];
	    [array2[i], array2[j]] = [array2[j], array2[i]];
	  }
	}

	//Remanie l'ordre de passage des joueurs,
	//Le joueur ayant choisi le domino le plus faible choisit son prochain domino en premier, et ainsi de suite
	function remaniementDesJoueurs(idSalon){
		var nouvelOrdre = [];
		var nouvelOrdreZones = [];
		//afficherTableau(salons[idSalon].dominosPick);
		for(var i=0;i<4;i++){
			var vMin = 999;
			for(var j=0;j<4;j++){
				if(salons[idSalon].dominosPick[j]!=undefined){ //L'utilisation de "delete" peut engendrer des "undefined"
					if(salons[idSalon].dominosPick[j]<vMin){
						vMin = salons[idSalon].dominosPick[j];
					}
				}
			}
			for(var k=0;k<4;k++){
				if(salons[idSalon].dominosPick[k]==vMin){
					nouvelOrdre.push(salons[idSalon].joueurs[k]);
					nouvelOrdreZones.push(salons[idSalon].zones[k]);
					delete salons[idSalon].dominosPick[k];
				}
			}
		}
		salons[idSalon].joueurs = nouvelOrdre;
		salons[idSalon].zones = nouvelOrdreZones;
        //afficherTousLesJoueurs(socket.salon);
        /*for(var i=0;i<salons[idSalon].zones.length;i++){
        	afficherZone(salons[idSalon].zones[i]);
        }*/
	}

	function verifPlacement(x,y,rotation,idDomino,idSalon,zone,checkOnly){
		//On vérifie si le domino ne dépasse pas de la zone
		if((x>-1)&&(y>-1)&&(x<5)&&(y<5)){
			var textDomino = 'domino'+idDomino;
			var dominosParses = JSON.parse(salons[idSalon].stockDomino);
			var case1 = dominosParses[textDomino]['case1'];
			var case2 = dominosParses[textDomino]['case2'];
			var tabVerif = [];
			//console.log(case1);
			//console.log(case2);
			tabVerif.push(verifCases(x,y,case1,zone,idSalon));
			//Si la premiere case ne chevauche pas une autre case non-vide, on continue
			if(tabVerif[0]!=-1){
				switch(rotation){
					//Rotation : Haut
					case 3:
						if(((Number(y)-1)>-1)&&((Number(y)-1)<5)){
							tabVerif.push(verifCases(x,Number(y)-1,case2,zone,idSalon));
							//Si la deuxième case ne chevauche pas une autre case non-vide, on continue
							if(tabVerif[1]!=-1){
								//Si un des deux dominos est adjacent à un autre domino valide (ou à la case de départ), on continue
								if(tabVerif[0]==1||tabVerif[1]==1){
									//SI CETTE DERNIERE CONDITION EST VALIDE, LE PLACEMENT DU DOMINO EST VALIDE AUSSI
									//"Prise en note" des modification effectuées sur la zone du joueur en plaçant le nouveau domino
									if(!checkOnly){
										zone[x][y] = case1;
										zone[x][Number(y)-1] = case2;
									}
									//afficherZone();
									return true;
								}
							}
						}
						break;
					//Rotation : Gauche
					case 0:
						if(((Number(x)+1)>-1)&&((Number(x)+1)<5)){
							tabVerif.push(verifCases(Number(x)+1,y,case2,zone,idSalon));
							if(tabVerif[1]!=-1){
								if(tabVerif[0]==1||tabVerif[1]==1){
									if(!checkOnly){
										zone[x][y] = case1;
										zone[Number(x)+1][y] = case2;
									}
									//afficherZone();
									return true;
								}
							}
						}
						break;
					//Rotation : Bas
					case 1:
						if(((Number(y)+1)>-1)&&((Number(y)+1)<5)){
							tabVerif.push(verifCases(x,Number(y)+1,case2,zone,idSalon));
							if(tabVerif[1]!=-1){
								if(tabVerif[0]==1||tabVerif[1]==1){
									if(!checkOnly){
										zone[x][y] = case1;
										zone[x][Number(y)+1] = case2;
									}
									//afficherZone();
									return true;
								}
							}
						}
						break;
					//Rotation : Droite
					case 2:
						if(((Number(x)-1)>-1)&&((Number(x)-1)<5)){
							tabVerif.push(verifCases(Number(x)-1,y,case2,zone,idSalon));
							if(tabVerif[1]!=-1){
								if(tabVerif[0]==1||tabVerif[1]==1){
									if(!checkOnly){
										zone[x][y] = case1;
										zone[Number(x)-1][y] = case2;
									}
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
	function verifCases(x,y,caseVerif,zone,idSalon){
    	// console.log("verifcase: "+x+" "+y+" "+caseVerif+" "+idSalon);
		//On vérifie que la case ne chevauche pas une autre case non-vide
		if(zone[x][y].biome==-1){
			if(salons[idSalon].verifPlac==true){
				return 1;
			}
			else{
				//On vérifie l'adjacence, c'est à dire que l'on regarde si il y a une case à côté, et si oui, quel est son biome
				//".biome == 0" (Case de départ)
				if((Number(y)-1)>0){
					if(zone[x][Number(y)-1].biome==caseVerif.biome||zone[x][Number(y)-1].biome==0){
						salons[idSalon].verifPlac = true;
						return 1;
					}
				}
				if((Number(x)+1)<5){
					if(zone[Number(x)+1][y].biome==caseVerif.biome||zone[Number(x)+1][y].biome==0){
						salons[idSalon].verifPlac = true;
						return 1;
					}
				}
				if((Number(y)+1)<5){
					if(zone[x][Number(y)+1].biome==caseVerif.biome||zone[x][Number(y)+1].biome==0){
						salons[idSalon].verifPlac = true;
						return 1;
					}
				}
				if((Number(x)-1)>0){
					if(zone[Number(x)-1][y].biome===caseVerif.biome||zone[Number(x)-1][y].biome==0){
						salons[idSalon].verifPlac = true;
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
	function finDePartie(idSalon){
		for(var i=0;i<4;i++){
			salons[idSalon].points.push(totallyBoardScore(salons[idSalon].zones[i]));
		}
		var ordreGagnant = [];
		var ordrePoints = [];
		for(var i=0;i<4;i++){
			var vMax = -1;
			for(var j=0;j<4;j++){
				if(salons[idSalon].points[j]!=undefined){
					if(salons[idSalon].points[j]>vMax){
						vMax = salons[idSalon].points[j];
					}
				}
			}
			for(var k=0;k<4;k++){
				if(salons[idSalon].points[k]==vMax){
					ordreGagnant.push(salons[idSalon].joueurs[k]);
					ordrePoints.push(salons[idSalon].points[k])
					delete salons[idSalon].points[k];
				}
			}
		}
		console.log("-w-w-w-w-w-w-w-w-");
		for(var i=0;i<4;i++){
			console.log(ordreGagnant[i]+" : "+ordrePoints[i]+"pts.");
		}
		console.log("Partie Terminée");
		salons[idSalon].partieTerminee = true;
		var recap = [ordreGagnant,ordrePoints];
		return recap;
	}

	function verifIdentite(idSalon,nom){
		var position = 0;
		for(var i=0;i<salons[idSalon].identite[0].length;i++){
			if(salons[idSalon].identite[0][i] == nom){
				position = i;
				break;
			}
		}
		if(salons[idSalon].identite[1][position]=="ordi"){
			return "ordi";
		}
		else{
			return "joueur";
		}
	}

	function creerOrdi(idSalon){
		salons[idSalon].nbJoueurs++;
		salons[idSalon].nbOrdis++;
	    salons[idSalon].joueurs.push("ordi"+salons[idSalon].nbOrdis);
	    salons[idSalon].identite[0].push("ordi"+salons[idSalon].nbOrdis);
	    salons[idSalon].identite[1].push("ordi");
	    salons[idSalon].dominosPick.push(0);
	    //----- Initialisation de la zone -----//
	    var zone = [];
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
	    	zone.push(tabTemp);
	    }
	    var caseDepart = {
	    	nbCouronnes: 0,
	    	biome: 0,
	    	valeurDominoAttribue: 0,
	    	isCounted: false
	    };
	    zone[2][2] = caseDepart;
	    salons[idSalon].zones.push(zone);
	}

	//Fonction utilisée par l'IA uniquement
	function choixOrdi(idSalon,nom){
		var choix = 0;
		var ordiCorrespondant = 0;
		if(salons[idSalon].numTour!=1){
			placementOrdi(idSalon,nom,salons[idSalon].dominosPickOrdis[parseInt(nom,4)-1]);
		}
		if(salons[idSalon].numTour<13){
			salons[idSalon].attendre = true;
			setTimeout(function(){
				console.log(nom+" est en train de choisir son domino...");
				do{
					choix = Math.floor(Math.random() * 4);
					if(choix==4){
						choix = 3;
					}
				}while(salons[idSalon].dominosPick.includes(salons[idSalon].dominosActuels[choix]));
			    salons[idSalon].dominosPick[salons[idSalon].quiJoue] = salons[idSalon].dominosActuels[choix];
				console.log(nom+" à choisi le domino : "+salons[idSalon].dominosActuels[choix]);
			    socket.emit('selectionDomino',{idDomino:salons[idSalon].dominosActuels[choix],joueur:salons[socket.salon].joueurs[salons[socket.salon].quiJoue]});
			    socket.broadcast.emit('selectionDomino',{idDomino:salons[idSalon].dominosActuels[choix],joueur:salons[socket.salon].joueurs[salons[socket.salon].quiJoue]});
			    salons[idSalon].dominosPickOrdis[parseInt(nom,4)-1] = salons[idSalon].dominosActuels[choix];
				salons[idSalon].attendre = false;
			},100);
			//while(salons[idSalon].attendre){}
		}
	}

	//Fonction utilisée par l'IA uniquement
	function placementOrdi(idSalon,nom,idDomino){
		console.log(nom+" est en train de choisir où placer son domino...");
		var listePlacementsValides = [];
		for(var orientation=0;orientation<4;orientation++){
			for(var i=0;i<5;i++){
				for(var j=0;j<5;j++){
					if(verifPlacement(i,j,orientation,idDomino,idSalon,salons[idSalon].zones[salons[idSalon].quiJoue],true)){
						var tab = [i,j,orientation];
						listePlacementsValides.push(tab);
					}
					salons[idSalon].verifPlac = false;
				}
			}
		}
		if(listePlacementsValides.length>0){
			var choix = Math.floor(Math.random() * listePlacementsValides.length);
			if(choix==listePlacementsValides.length){
				choix = listePlacementsValides.length-1;
			}
			var vraiChoix = listePlacementsValides[choix];
	        var infos = {
	        	x : vraiChoix[0],
		        y : vraiChoix[1],
		        o : vraiChoix[2],
		        id : idDomino,
		        joueur : nom
	        }
	        verifPlacement(vraiChoix[0],vraiChoix[1],vraiChoix[2],idDomino,idSalon,salons[idSalon].zones[salons[idSalon].quiJoue],false);
			salons[idSalon].verifPlac = false;
			socket.emit('joueAutreJoueur',infos);
	        socket.broadcast.emit('joueAutreJoueur',infos);
			console.log(nom+" a placé son domino.");
		}
		else{
			console.log(nom+" a défaussé son domino.")
		}
		console.log("J'ai fini.");
	}

	//Fonction de debug
	function afficherTousLesJoueurs(idSalon){
		console.log("----- Ordre des joueurs -----");
		for(var i=0;i<salons[idSalon].nbJoueurs;i++){
	    	console.log(salons[idSalon].joueurs[i]);
	    }
	}

	//Fonction de debug
	function afficherZone(zone){
		console.log("----- Zone -----");
		var i = 0;
		for(var j=0;j<5;j++){
			console.log(zone[i][j].biome+""+""+zone[i+1][j].biome+""+""+zone[i+2][j].biome+""+""+zone[i+3][j].biome+""+""+zone[i+4][j].biome);
		}
	}

	//Fonction de debug
	function afficherIdentites(idSalon){
		console.log("----- Identites -----")
		for(var i=0;i<salons[idSalon].identite[0].length;i++){
			console.log(salons[idSalon].identite[0][i]+" est un : "+salons[idSalon].identite[1][i]);
		}
	}

	//Fonction de debug
	function afficherTableau(tab){
		console.log("----- Tableau -----")
		for(var i=0;i<tab.length;i++){
			console.log(tab[i]);
		}
	}
});

server.listen(8080);
