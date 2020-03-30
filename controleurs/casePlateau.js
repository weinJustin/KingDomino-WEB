function trowId(){
  if(monTour){
    monTour = false;
    var arrayBrut = dernierPlacement.id.split("");
    //format normalisé : {x,y,orientation,id domino,nom joueur}
    var result = {'x':Number(arrayBrut[4]),'y':Number(arrayBrut[5]),'o':Number(orientation),'id':Number(choix[0]),'joueur':nom};
    dernierCoupEnvoyer = choix[0];
    choix.shift();
    socket.emit('jouer',result);
  }
}

function placerSurGrille(balise){
  if(monTour){
    dernierPlacement = balise;
    var arrayBrut = dernierPlacement.id.split("");
    placement(Number(arrayBrut[4]),Number(arrayBrut[5]),orientation,choix[0],'adv1');
  }

}

function rotation(direction){
  if(monTour){
    if (direction == 'h'){
      orientation ++;
    }else if (direction == 'ah') {
      orientation --;
    }

    if (orientation>3) {
      orientation = 0
    }
    if (orientation<0) {
      orientation = 3
    }
    var arrayBrut = dernierPlacement.id.split("");
    // console.log("x: "+arrayBrut[4]+"\ny: "+arrayBrut[5]+"\nrot: "+orientation+"\nid: "+choix[0]+"\nplace: adv1");
    placement(Number(arrayBrut[4]),Number(arrayBrut[5]),orientation,choix[0],'adv1');
  }

}

function finDePartie() {
  socket.emit('finDePartie');
}

function defausse() {
  socket.emit('defausse');
}

function choisir(balise){
  if(faireChoix){
    faireChoix =false;
    var tmp = Number(balise.id.substr(6));
    // console.log(balise.id);
    // console.log(tmp);
    choix.push(tmp);
    dernierChoixRenduInerte = balise.parentNode.id ;
    // placement(0,0,0,tmp,dernierChoixRenduInerte)
    balise.onclick = null
    socket.emit('choisir',choix[choix.length - 1]);
    if(!premiertour){
      monTour = true;
      changerFeedBack("C'est votre tour. Placer votre domino");
    }else{
      premiertour = false;
    }
  }
}

function lumiereOn(balise){
    $(balise).css({'background-color':maCouleurClaire});
}

function lumiereOff(balise){
    $(balise).css({'background-color':maCouleur});
}

$( document ).ready(function(){
  for (var i = 0; i <5; i++){
    for (var j = 0; j <5; j++){
      var id = 'case'+i+j;
      var div = "<div class='case' id='"+id+"' onclick='placerSurGrille(this)' onmouseover='lumiereOn(this)' onmouseleave='lumiereOff(this)'><div>";
      $("div.plateauJoueur").append(div);
      $("#"+id).css({"left":i*20+"%","top":j*20+"%"});
    }
  }

  //NE PAS CHANGER LA TAILLE DES MOTS
  tab = ["domPris","domChoi"];
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 4; j++) {
      var id = tab[i]+(j+1);
      var div = "<div class='domino' id='"+id+"' '>";
      $("#domCol"+(i+1)).append(div);
      $("#"+id).css({"top":j*45+"%"});

    }
  }
});
