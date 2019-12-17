function trowId(balise){
  if(monTour){
    var arrayBrut = balise.id.split("");
    //format normalisé : {x,y,orientation,id domino,nom joueur}
    var result = {'x':arrayBrut[4],'y':arrayBrut[5],'o':0,'id':choix,'joueur':nomJoueur[0]};
    placement(arrayBrut[4],arrayBrut[5],0,choix);
    dernierCoupEnvoyer = choix;
    monTour = false;
    socket.emit('jouer',result);
  }
}

function choisir(balise){
  if(faireChoix){
    var tmp = balise.id.substr(6);
    choix = [tmp,balise.id];
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
      var div = "<div class='case' id='"+id+"' onclick='trowId(this)' onmouseover='lumiereOn(this)' onmouseleave='lumiereOff(this)'><div>";
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
