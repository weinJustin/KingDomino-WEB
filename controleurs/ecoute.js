socket.on('joueAutreJoueur',function(domino){
  placement(domino['x'],domino['y'],domino['o'],domino['id'],domino['joueur']);

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
  var test = 2;
  for (var i = 0; i < nomJoueur.length; i++) {
    console.log(nomJoueur[i]);
    if (nomJoueur[i] != nom){
      console.log("#adv"+(test));
      $("#adv"+(test)).css({'background-color':couleur[i][0]});
      placement(2,2,0,"Depart"+couleur[i][2],"adv"+(test))
      $("#adv"+(test)).attr("id","caseJoueur"+nomJoueur[i]);
      test+=1;
      console.log(test);
    }else {
      $(".case").css({'background-color':couleur[i][0]});
      placement(2,2,0,"Depart"+couleur[i][2],"adv1");
      maCouleur = couleur[i][0];
      maCouleurClaire = couleur[i][1];
    }
  }
});
//
// socket.on('valide',function(valide){
//   if(valide){
//     dernierCoupEnvoyer = -1;
//   }else{
//     changerFeedBack("Placement invalide. Replacer votre domino");
//     choix.unshift(dernierCoupEnvoyer);
//     monTour =true;
//   }
// });
//
// socket.on("selectionDomino",function(idDomino){
//   $("#domino"+idDomino).attr("onclick","");;
//   // placement(0,0,0,idDomino,baliseParent)
// });
//
// socket.on('envoyerNouveauxDominos',function(dominos){
//   for (var j = 0; j < 4; j++) {
//     //on recupere les elements dans chaque emplacement pour les décaler
//
//     var tmp = document.getElementById("domChoi"+(j+1)).firstChild;
//     // console.log(tmp);
//
//
//     if(tmp != null){
//       placement(0,0,0,tmp.id.substr(6),"domPris"+(j+1));
//     }
//
//     //on place les nouveaux dominos
//     placement(0,0,0,dominos[j],"domChoi"+(j+1),"onclick='choisir(this)'");
//   }
// });
