function mousePressed() {
  //fonction de validation, d'envoie et de placement
  if(monTour && intervalCase(mouseX,mouseY,placable["fini"])){
      monTour = false;
      //format normalisé : {x,y,orientation,id domino,nom joueur}
      var result = {'x':dernierPlacement.x,'y':dernierPlacement.y,'o':orientation,'id':choix[0].substr(6),'joueur':nom};
      dernierCoupEnvoyer = choix[0];
      choix.shift();
      socket.emit('jouer',result);
      joueurSuivant()
  }else if(monTour && intervalCase(mouseX,mouseY,placable["principal"])){
      var tmp = obtenirCoordonee(mouseX,mouseY,placable['principal'])
      if(tmp.x == dernierPlacement.x && tmp.y == dernierPlacement.y){
        orientation++
      }
      if (orientation>3) {
        orientation = 0
      }
      dernierPlacement =tmp
      console.log(dernierPlacement);
      placement(dernierPlacement.x,dernierPlacement.y,orientation,choix[0],'principal');
  }else if(monTour && intervalCase(mouseX,mouseY,placable["defausse"])){
    monTour = false;
    placable[choix[0]].visible = false
    socket.emit('defausse',choix[0]);
    choix.shift();
  }

 // choisi un domino
 if(faireChoix){
     for(var i =0;i<4;i++){
       if (intervalCase(mouseX,mouseY,placable["domChoi"+(i+1)]) && placable["domChoi"+(i+1)].dernierDomPlace != null ){
         if(!placable[placable["domChoi"+(i+1)].dernierDomPlace].choisi){
           faireChoix =false;
           choix.push(placable["domChoi"+(i+1)].dernierDomPlace);
           placable[placable["domChoi"+(i+1)].dernierDomPlace].choisi = true

           socket.emit('choisir',Number(choix[choix.length - 1].substr(6)));
           if(!premiertour){
             monTour = true;
             changerFeedBack("C'est votre tour. Placer votre domino");
           }else{
             premiertour = false;
           }
         }
         break
       }
     }
   }
}
