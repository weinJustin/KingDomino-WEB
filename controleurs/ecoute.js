socket.on('joueAutreJoueur',function(domino){
  placement(domino['x'],domino['y'],domino['o'],domino['id'],domino['joueur']);
});

socket.on('tonTour',function(moi){
  if(moi== nom){
    if(choix==null){
      faireChoix =true;
    }else {
      monTour =true;
    }
  }
});

socket.on('valide',function(valide){
  if(valide){
    dernierCoupEnvoyer = -1;
    faireChoix =true;
  }else{
    placement(0,0,0,"domino"+dernierCoupEnvoyer[0],dernierCoupEnvoyer[1]);
    monTour =true;
  }
});

socket.on("choixInvalide",function() {
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
