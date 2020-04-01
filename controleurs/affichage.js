// function removeElement(id) {
//     var elem = document.getElementById(id);
//     return elem.parentNode.removeChild(elem);
// }
//
//
function changerFeedBack(message){
  console.log(document.getElementById("feedback"));
  document.getElementById("feedback").innerHTML = message;
}



function setup() {
  largeurCanevas = Math.floor(windowWidth-5)
  hauteurCanevas = Math.floor(windowHeight-4)

  lPourcent = largeurCanevas/100
  hPourcent = hauteurCanevas/100

  for (var i = 0; i < 4; i++) {
    placable["king"+couleur[i][2]] = new Affichable(0,0,0,0,1,1)
    placable["king"+couleur[i][2]].visible = false
    placable["king"+couleur[i][2]].id = "king"+couleur[i][2]
    placable["king"+couleur[i][2]].img = loadImage("../static/pieces/"+"king"+couleur[i][2]+".png")
    placable["king"+couleur[i][2]].place = "principal"
  }
  //(x,y,o,taille,ratio,nbrCase)

  // largeurCanevas = 1000
  // hauteurCanevas = 500
  placable['principal'] = new Affichable(lPourcent*marge,hPourcent*marge,0,hPourcent*50,1,5)
  placable['principal'].color = maCouleur

  var tmp = lPourcent*marge + lPourcent*2 + placable['principal'].taille
  placable['fini'] = new Affichable(tmp,hPourcent*marge,0,hPourcent*5,2,1)
  placable['fini'].color = maCouleur

  placable['typoFini']= new Affichable(placable['fini'].taille +placable['fini'].x,(placable['fini'].taille/2)+placable['fini'].y,0,hPourcent*5,2,1)
  placable['typoFini'].text = "Valider"
  placable['typoFini'].place = 'fini'

  placable['defausse'] = new Affichable(tmp,placable['fini'].taille +((hPourcent*marge)*2),0,hPourcent*5,2,1)
  placable['defausse'].color = maCouleur

  placable['typoDefausse']= new Affichable(placable['defausse'].taille +placable['defausse'].x,(placable['defausse'].taille/2)+placable['defausse'].y,0,hPourcent*5,2,1)
  placable['typoDefausse'].text = "Deffausser"
  placable['typoDefausse'].place = 'defausse'


  for (var i = 0; i < 3; i++) {
    var nom = 'adv'+i
    tmp = placable['principal'].taille + (hPourcent*marge*2)
    placable[nom] = new Affichable((30*lPourcent)*i + lPourcent*marge,tmp,0,hPourcent*35,1,5)
    placable[nom].color = maCouleur

  }

  tab = ["domPris","domChoi"];
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 4; j++) {
      var id = tab[i]+(j+1);
      placable[id] = new Affichable((lPourcent* i*20 )+ (lPourcent*50),(hPourcent* j*13) + (hPourcent*5),0,hPourcent*10,2,1)
      placable[id].color = maCouleur

    }
  }

  angleMode(DEGREES);
  rectMode(CORNER);

  createCanvas(largeurCanevas,hauteurCanevas);


  loop()
}

function draw() {
  clear()
  // background(220);
  // if (intervalCase(mouseX,mouseY,places['principal'])){
  //   caseTMP = obtenirCoordonee(mouseX,mouseY,'principal')
  //   caseTMP = obtenirPositionAvecCoordonee(caseTMP.x,caseTMP.y,'principal')
  //
  //
  //   xCase = caseTMP.x
  //   yCase = caseTMP.y
  //
  //   fill(100);
  //   rect(xCase, yCase, places['principal'].taille1Case,(places['principal'].tailleUneCase)*2);
  // }
  for (x in placable){
    if(placable[x].visible && !x.startsWith("king")){
      push()
      if(placable[x].color!=null){
        fill(placable[x].color);
        rect(placable[x].x, placable[x].y, placable[x].taille*placable[x].ratio,placable[x].taille)
      }else if (placable[x].text!=null) {
        var width = placable[placable[x].place].taille
        textSize(width / 3);
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

        facteurTaille = resizeTo(placable[x].img.height,placable[x].img.width,taille1case,taille1case*placable[x].ratio)
        translate(placable[x].x, placable[x].y)
        scale(facteurTaille.h,facteurTaille.l)
        rotate(placable[x].o)
        image(placable[x].img, 0,0);
      }
    }
    pop()
  }

}

function resizeTo(hauteur,largeur,hauteurCible,largeurCible){
  return {h:hauteurCible/hauteur,l:largeurCible/largeur}
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
