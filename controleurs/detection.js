function mousePressed() {
  //fonction de validation, d'envoie et de placement
  if(monTour && intervalCase(mouseX,mouseY,places["fini"])){
      monTour = false;
      //format normalisé : {x,y,orientation,id domino,nom joueur}
      var result = {'x':dernierPlacement.x,'y':dernierPlacement.y,'o':orientation,'id':choix[0],'joueur':nom};
      dernierCoupEnvoyer = choix[0];
      choix.shift();
      socket.emit('jouer',result);
  }else if(monTour){
      var tmp = obtenirCoordonee(mouseX,mouseY,places['principal'])
      if(tmp.x == dernierPlacement.x && tmp.y == dernierPlacement.y){
        orientation++
      }
      if (orientation>3) {
        orientation = 0
      }
      dernierPlacement =tmp
      placement(dernierPlacement.x,dernierPlacement.y,orientation,choix[0],'principal');
  }

 // choisi un domino
 if(faireChoix){
     for(var i =0;i<4;i++){
       if (intervalCase(mouseX,mouseY,places["domChoi"+(i+1)]) && places["domChoi"+(i+1)].dernierDomPlace != null ){
         if(!images[places["domChoi"+(i+1)].dernierDomPlace].choisi){
           faireChoix =false;
           choix.push(places["domChoi"+(i+1)].dernierDomPlace);
           images[places["domChoi"+(i+1)].dernierDomPlace].choisi = true
           socket.emit('choisir',choix[choix.length - 1]);
           if(!premiertour){
             monTour = true;
             changerFeedBack("C'est votre tour. Placer votre domino");
           }else{
             premiertour=false

           }
         }
         break
       }
     }
   }
}
