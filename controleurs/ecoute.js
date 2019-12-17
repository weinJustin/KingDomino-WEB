socket.on('joueAutreJoueur',function(domino){
  placement(domino['x'],domino['y'],domino['o'],domino['id'],domino['joueur']);
});

socket.on('tonTour',function(moi){
  if(moi== nom){
    if(choix==null){
      changerFeedBack("C'est votre tour. Choisisez un domino");
      faireChoix =true;
    }else {
      changerFeedBack("C'est votre tour. Placer votre domino");
      monTour =true;
    }
  }
});

socket.on('valide',function(valide){
  if(valide){
    dernierCoupEnvoyer = -1;
    changerFeedBack("C'est votre tour. Choisisez un domino");
    faireChoix =true;
  }else{
    placement(0,0,0,"domino"+dernierCoupEnvoyer[0],dernierCoupEnvoyer[1]);
    changerFeedBack("Placement invalide. Replacer votre domino");
    monTour =true;
  }
});

socket.on("choixInvalide",function() {
  changerFeedBack("Choix invalide. Choisissez un autre domino");
  faireChoix =true;
})

socket.on('envoyerNouveauxDominos',function(dominos){
  for (var j = 0; j < 4; j++) {
    //on recupere les elements dans chaque emplacement pour les décaler
    // console.log($("#domChoi"+(j+1)).children());
    // var tmp = $("#domChoi"+(j+1)).children().id;
    // if(tmp){
    //   placement(0,0,0,tmp,"domPris"+(j+1));
    // }

    //on place les nouveaux dominos
    placement(0,0,0,dominos[j],"domChoi"+(j+1),"onclick='choisir(this)'");
  }
});
