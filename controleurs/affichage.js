// function removeElement(id) {
//     var elem = document.getElementById(id);
//     return elem.parentNode.removeChild(elem);
// }
//
//
function changerFeedBack(message){
  placable['typoDeFeedback'].text = message
  // console.log(document.getElementById("feedback"));
  // document.getElementById("feedback").innerHTML = message;
}

function calculEnvMobile(){
    hauteurCanevas = largeurCanevas*2
    hPourcent = hauteurCanevas/100

    //(x,y,o,taille,ratio,nbrCase)
    placable['principal'] = new Affichable(largeurCanevas/2-lPourcent*40,hPourcent*marge,0,lPourcent*80,1,5)
    placable['principal'].color = maCouleur

    var tmp = hPourcent*marge + hPourcent*2 + placable['principal'].taille
    placable['fini'] = new Affichable(placable['principal'].x,tmp,0,hPourcent*5,2,1)
    placable['fini'].color = maCouleur

    placable['defausse'] = new Affichable(placable['principal'].x + placable['principal'].taille  - hPourcent*10,tmp,0,hPourcent*5,2,1)
    placable['defausse'].color = maCouleur

    for (var i = 0; i < 3; i++) {
      var nom = 'adv'+i
      placable[nom] = new Affichable(placable['principal'].x,placable['principal'].y,0,hPourcent*40,1,5)
      placable[nom].color = maCouleur
      placable[nom].visible = false

    }

    tab = ["domPris","domChoi"];
    tmp = placable['principal'].x + placable['principal'].taille  - hPourcent*16
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 4; j++) {
        var id = tab[i]+(j+1);
        placable[id] = new Affichable((lPourcent* i*20 )+ placable['principal'].x,(hPourcent* j*10) + (hPourcent*marge*2)+placable['principal'].taille+placable['fini'].taille ,0,hPourcent*8,2,1)
        placable[id].color = maCouleur
        if(i==1){
          placable[id].x= tmp
        }
      }

    }


    placable['feedback'] = new Affichable(placable['principal'].x + placable['fini'].taille*2 + marge*lPourcent ,placable['fini'].y,0,hPourcent*5,3,1)
    placable['feedback'].color = maCouleur

    placable['typoDeFeedback']= new Affichable(placable['feedback'].taille*1.5 +placable['feedback'].x,(placable['feedback'].taille/2)+placable['feedback'].y,0,hPourcent*5,2,1)
    placable['typoDeFeedback'].text = "Bienvenue"
    placable['typoDeFeedback'].place = 'feedback'
    console.log(placable);

}

function calculEnv() {



  //(x,y,o,taille,ratio,nbrCase)

  // largeurCanevas = 1000
  // hauteurCanevas = 500
  placable['principal'] = new Affichable(lPourcent*marge,hPourcent*marge,0,hPourcent*40,1,5)
  placable['principal'].color = maCouleur

  var tmp = lPourcent*marge + lPourcent*2 + placable['principal'].taille
  placable['fini'] = new Affichable(tmp,hPourcent*marge,0,hPourcent*5,2,1)
  placable['fini'].color = maCouleur



  placable['defausse'] = new Affichable(tmp,placable['fini'].taille +((hPourcent*marge)*2),0,hPourcent*5,2,1)
  placable['defausse'].color = maCouleur




  tmp = placable['principal'].taille + (hPourcent*marge*2)
  for (var i = 0; i < 3; i++) {
    var nom = 'adv'+i
    placable[nom] = new Affichable((30*lPourcent)*i + lPourcent*marge,tmp,0,hPourcent*35,1,5)
    placable[nom].color = maCouleur

  }

  tab = ["domPris","domChoi"];
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 4; j++) {
      var id = tab[i]+(j+1);
      placable[id] = new Affichable((lPourcent* i*20 )+ (lPourcent*40),(hPourcent* j*10) + (hPourcent*5),0,hPourcent*8,2,1)
      placable[id].color = maCouleur

    }
  }

  tmp = hPourcent*marge*3 + placable['principal'].taille +placable['adv1'].taille
  placable['feedback'] = new Affichable(lPourcent*marge,tmp,0,hPourcent*5,20,1)
  placable['feedback'].color = maCouleur

  placable['typoDeFeedback']= new Affichable(placable['feedback'].taille*10 +placable['feedback'].x,(placable['feedback'].taille/2)+placable['feedback'].y,0,hPourcent*5,2,1)
  placable['typoDeFeedback'].text = "Bienvenue"
  placable['typoDeFeedback'].place = 'feedback'
}



function setup() {
  largeurCanevas = Math.floor(windowWidth-5)
  hauteurCanevas = Math.floor(windowHeight-4)
  lPourcent = largeurCanevas/100
  hPourcent = hauteurCanevas/100

  if(largeurCanevas/hauteurCanevas < 1.5){
    modeMobile = true
  }

  for (var i = 0; i < 4; i++) {
    placable["king"+couleur[i][2]] = new Affichable(0,0,0,0,1,1)
    placable["king"+couleur[i][2]].visible = false
    placable["king"+couleur[i][2]].id = "king"+couleur[i][2]
    placable["king"+couleur[i][2]].img = loadImage("../static/pieces/"+"king"+couleur[i][2]+".png")
    placable["king"+couleur[i][2]].place = "principal"
  }
  if(modeMobile){
    calculEnvMobile()
  }else{
    calculEnv()
  }

  placable['typoFini']= new Affichable(placable['fini'].taille +placable['fini'].x,(placable['fini'].taille/2)+placable['fini'].y,0,hPourcent*5,2,1)
  placable['typoFini'].text = "Valider"
  placable['typoFini'].place = 'fini'

  placable['typoDefausse']= new Affichable(placable['defausse'].taille +placable['defausse'].x,(placable['defausse'].taille/2)+placable['defausse'].y,0,hPourcent*5,2,1)
  placable['typoDefausse'].text = "Defausser"
  placable['typoDefausse'].place = 'defausse'




  angleMode(DEGREES);
  rectMode(CORNER);

  createCanvas(largeurCanevas,hauteurCanevas);

  loop()
}

// function windowResized() {
//   largeurCanevas = Math.floor(windowWidth-5)
//   hauteurCanevas = Math.floor(windowHeight-4)
//   calculEnv()
//   resizeCanvas(largeurCanevas,hauteurCanevas);
// }

function draw() {
  clear()
  for (x in placable){
    if(placable[x].visible && !x.startsWith("king")){
      push()
      if(placable[x].color!=null){
        fill(placable[x].color);
        rect(placable[x].x, placable[x].y, placable[x].taille*placable[x].ratio,placable[x].taille)
      }else if (placable[x].text!=null) {
        var width = placable[placable[x].place].taille
        if(text.length>20 && modeMobile){
            textSize(width / 5);
        }else {

          textSize(width / 3);
        }
        textAlign(CENTER,CENTER);
        text(placable[x].text,placable[x].x, placable[x].y)
      }else{
        var taille1case = placable[placable[x].place].taille1Case

        facteurTaille = resizeTo(placable[x].img.height,placable[x].img.width,taille1case,taille1case*placable[x].ratio)
        translate(placable[x].x, placable[x].y)
        placable[x].img.resize(taille1case*placable[x].ratio,taille1case)
        rotate(placable[x].o)
        image(placable[x].img, 0,0);
      }
      pop()
    }

  }

  for (var i = 0; i < 4; i++) {
    push()
    if (placable["king"+couleur[i][2]] !== undefined ){
      if (placable["king"+couleur[i][2]].visible){
        x = "king"+couleur[i][2]
        var taille1case = placable[placable[x].place].taille1Case
        translate(placable[x].x, placable[x].y)
        placable[x].img.resize(taille1case*placable[x].ratio,taille1case)
        rotate(placable[x].o)
        image(placable[x].img, 0,0);
      }
    }
    pop()
  }

}

function joueurSuivant(){
  if(!modeMobile){return 0}
  if(joueurSuivantActif){
    enAttente++
  }else{
    console.log(tourJoueur);
    joueurSuivantActif= true
    setTimeout(function(){
      for (var x in placable) {
        var place = placable[x].place
        // console.log("on observe: ")
        // console.log(x);
        // console.log(place);
        if (place!= null) {
          if(place.startsWith("adv") || place == "principal"){
            if (placable[x].place == tourJoueur[0]) {
              // console.log("on rend visible ")
              placable[x].visible = true
              placable[place].visible = true
            }else {
              // console.log("on rend invisible ")
              placable[x].visible = false
              placable[place].visible = false
            }
          }else {
            // console.log("on ne fait rien");
          }
        }else {
          // console.log("on ne fait rien");
        }
      }
      redraw();
      tourJoueur.shift()
      if (enAttente > 0 ) {
        enAttente--
        joueurSuivant()
      }
      joueurSuivantActif= false

    }, 3000);
  }
}

function placement(x,y,rot,id,place,ratio=2){
  var angle =  (rot * 90)
  var xTemp = x
  var yTemp = y
  if (angle == 90) {
    xTemp = x+1
  }else if (angle == 180) {
    xTemp = x+1
    yTemp = y+1
  }else if (angle == 270) {
    yTemp = y+1
  }

  var tmp = obtenirPositionAvecCoordonee(xTemp,yTemp,placable[place])
  var xTemp = tmp.x
  var yTemp = tmp.y

  placementCore(xTemp,yTemp,rot,id,place,ratio)

}

function placementCentre(imgNom,place,ratio=1){
    var xTemp = placable[place].taille/2 + placable[place].x
    var yTemp =  placable[place].y
    placementCore(xTemp,yTemp,0,imgNom,place,ratio)
}

function placementCore(x,y,rot,id,place,ratio){

  if(!id.startsWith("king")){
    placable[place].dernierDomPlace = id
  }
  if (placable[id] !== undefined){
    placable[id].x = x
    placable[id].y = y
    placable[id].o = rot*90
    placable[id].place = place
    redraw()
  }else {
    loadImage("../static/pieces/"+id+".png", img => {
      placable[id] =new Affichable(x,y,rot,1,ratio,1)
      placable[id].img = img
      placable[id].id = id
      placable[id].choisi = false
      placable[id].place = place
      redraw()
    })
  }
}
