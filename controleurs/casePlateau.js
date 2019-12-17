function trowId(){
  if(monTour){
    monTour = false;
    var arrayBrut = dernierPlacement.id.split("");
    //format normalisé : {x,y,orientation,id domino,nom joueur}
    var result = {'x':Number(arrayBrut[4]),'y':Number(arrayBrut[5]),'o':Number(orientation),'id':Number(choix[0]),'joueur':nom};
    dernierCoupEnvoyer = choix;
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

function choisir(balise){
  if(faireChoix){
    var tmp = balise.id.substr(6);
    choix = [tmp,balise.firstParent];
    socket.emit('choisir',choix[0]);
    faireChoix =false;
  }
}

function lumiereOn(balise){
    $(balise).css({'background-color':'#1a53ff'});
}

function lumiereOff(balise){
    $(balise).css({'background-color':'#0039e6'});
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
    for (var j = 0; j < 5; j++) {
      var id = tab[i]+(j+1);
      var div = "<div class='domino' id='"+id+"' onclick='choisir(this.firstChild)'>";
      $("#domCol"+(i+1)).append(div);
      $("#"+id).css({"top":j*33+"%"});

    }
  }
});