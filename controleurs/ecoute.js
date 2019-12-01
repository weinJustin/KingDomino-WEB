socket.on('joueAutreJoueur',function(domino){

});

socket.on('tonTour',function(id){
  monTour =true;
});

socket.on('valide',function(valide){
  if(valide){
    dernierCoupEnvoyer = -1;
  }else{

  }
});

socket.on('envoyerNouveauxDominos',function(data){

});
