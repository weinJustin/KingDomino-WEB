socket.on('joueAutreJoueur',function(domino){
  placement(domino['x'],domino['y'],domino['o'],domino['id'],domino['joueur']);
});

socket.on('tonTour',function(){
  monTour =true;
});

socket.on('premierTour',function(){
  faireChoix =true;
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
  for (var j = 0; j < 5; j++) {
    //on recupere les elements dans chaque emplacement pour les décaler
    var tmp = getElementById("#domChoi"+(i+1)).firstChild().id;
    placement(0,0,0,tmp,"domPris"+(i+1));
    //on place les nouveaux dominos
    placement(0,0,0,domino[i],"domChoi"+(i+1),"onclick='choisir(this)'");

  }
});
