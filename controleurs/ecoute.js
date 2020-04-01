socket.on('joueAutreJoueur',function(domino){
  placement(domino['x'],domino['y'],domino['o'],"domino"+ domino['id'],listeJoueur[domino['joueur']].nom);

});

socket.on('tonTour',function(moi){
  if(moi== nom){
      if(dernierTour){
        changerFeedBack("C'est votre tour. Placez votre domino");
        monTour = true
      }else{
        changerFeedBack("C'est votre tour. Choisisez un domino");
        faireChoix =true;
      }

  }else{
      changerFeedBack("C'est le tour de "+moi);
  }
});

socket.on('joueurPresent',function(nomJoueur){
  var id = 0;
  for (var i = 0; i < nomJoueur.length; i++) {
    if (nomJoueur[i] != nom){
      placement(2,2,0,"dominoDepart"+couleur[i][2],"adv"+(id),1)
      placable["adv"+(id)].color = couleur[i][0]
      listeJoueur[nomJoueur[i]] = {}
      listeJoueur[nomJoueur[i]].nom = "adv"+(id)
      listeJoueur[nomJoueur[i]].color = couleur[i][2]
      id++;
    }else {
      placement(2,2,0,"dominoDepart"+couleur[i][2],"principal",1);
      maCouleur = couleur[i][0];
      maCouleurClaire = couleur[i][1];
      placable["principal"].color = maCouleur
      listeJoueur[nom] = {}
      listeJoueur[nom].nom = "principal"
      listeJoueur[nom].color = couleur[i][2]
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

socket.on("selectionDomino",function(data){
  placable["domino"+data.idDomino].choisi = true
  placable["king"+listeJoueur[data.joueur].color].visible = true
  placementCentre("king"+listeJoueur[data.joueur].color,placable["domino"+data.idDomino].place)
});

socket.on('envoyerNouveauxDominos',function(dominos){
  var nouvX = placable["domPris1"].taille/2 + placable["domPris1"].x
  //on recupere les elements dans chaque emplacement pour les décaler
  for (var j = 0; j < 4; j++) {
    var tmp = placable["domChoi"+(j+1)].dernierDomPlace
    if (placable["king"+couleur[j][2]] !== undefined ){
      placable["king"+couleur[j][2]].x = nouvX
    }

    if(tmp != null){
      placement(0,0,0,tmp,"domPris"+(j+1));
    }

    //on place les nouveaux dominos
    if(dominos.length == 4){
      placement(0,0,0,"domino"+dominos[j],"domChoi"+(j+1));
    }else{
      dernierTour = true;
    }
  }
});

socket.on("defausse", function(idDomino){
  placable[idDomino].visible = false
})

socket.on("resultatFinal",function (resultatFinal) {
  var retour = ""
  for (var i = 0; i < 4; i++) {
    retour += i +" : "+resultatFinal[0][i]+", score: "+resultatFinal[1][i]+"\n"
  }
  alert(retour)

})
