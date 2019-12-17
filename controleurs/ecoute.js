socket.on('joueAutreJoueur',function(domino){
  console.log(domino);
  placement(domino['x'],domino['y'],domino['o'],domino['id'],"caseJoueur"+domino['joueur']);
});

socket.on('tonTour',function(moi){
  if(moi== nom){
      changerFeedBack("C'est votre tour. Choisisez un domino");
      faireChoix =true;

  }else{
      changerFeedBack("C'est le tour de "+moi);
  }
});

socket.on('joueurPresent',function(nomJoueur){
  for (var i = 0; i < nomJoueur.length; i++) {
    var tmp = 2;
    if (nomJoueur[i] != nom){
      $("#adv"+(i+2)).attr("id","caseJoueur"+nomJoueur[i]);
      tmp++;
    }
  }
});

socket.on('valide',function(valide){
  if(valide){
    dernierCoupEnvoyer = -1;
  }else{
    changerFeedBack("Placement invalide. Replacer votre domino");
    choix.unshift(dernierCoupEnvoyer);
    monTour =true;
  }
});

socket.on("choixInvalide",function() {
  changerFeedBack("Choix invalide. Choisissez un autre domino");
  faireChoix =true;
});

socket.on('envoyerNouveauxDominos',function(dominos){
  for (var j = 0; j < 4; j++) {
    //on recupere les elements dans chaque emplacement pour les décaler

    var tmp = document.getElementById("domChoi"+(j+1)).firstChild;
    // console.log(tmp);


    if(tmp != null){
      placement(0,0,0,tmp.id.substr(6),"domPris"+(j+1));
    }

    //on place les nouveaux dominos
    placement(0,0,0,dominos[j],"domChoi"+(j+1),"onclick='choisir(this)'");
  }
});
