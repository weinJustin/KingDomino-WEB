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

  // largeurCanevas = 1000
  // hauteurCanevas = 500
  places['principal'] = {}
  places['principal'].taille = hPourcent*50
  places['principal'].x = lPourcent*marge
  places['principal'].y = hPourcent*marge
  places['principal'].taille1Case = (places['principal'].taille)/5
  places['principal'].type = "jeu"

  for (var i = 0; i < 3; i++) {
    var nom = 'adv'+i
    places[nom] = {}
    places[nom].taille = hPourcent*35
    places[nom].x =(30*lPourcent)*i + lPourcent*marge
    places[nom].y = places['principal'].taille + (hPourcent*marge*2)
    places[nom].taille1Case = (places[nom].taille)/5
    places[nom].type = "jeu"
  }

    tab = ["domPris","domChoi"];
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 4; j++) {
        var id = tab[i]+(j+1);
        places[id] = {}
        places[id].taille = (hauteurCanevas/100)*10
        places[id].x = (lPourcent* i*20 )+ (lPourcent*50)
        places[id].y = (hPourcent* j*13) + (hPourcent*5)
        places[id].taille1Case = (places[id].taille)
        places[id].type = "col"
      }
    }

  angleMode(DEGREES);
  rectMode(CORNER);

  createCanvas(largeurCanevas,hauteurCanevas);
  loop()
}

function draw() {
  background(220);
  fill(255);
  for (var x in places) {
    if (places[x].type == "col"){
      rect(places[x].x, places[x].y, places[x].taille*2,places[x].taille);
    }else {
      square(places[x].x, places[x].y, places[x].taille);
    }
  }
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

  for (var x in images) {
      var taille1case = places[images[x].place].taille1Case
      var facteurTaille = resizeTo(images[x].img.height,images[x].img.width,taille1case,taille1case*2)
      push()
      translate(images[x].x, images[x].y)
      scale(facteurTaille.h,facteurTaille.l)
      rotate(images[x].rot)
      image(images[x].img, 0,0);
      pop()
  }

}

function resizeTo(hauteur,largeur,hauteurCible,largeurCible){
  return {h:hauteurCible/hauteur,l:largeurCible/largeur}
}

function placement(x,y,rot,id,place){

  var angle =  (rot * 90)

  var xTemp = x
  var yTemp = y

  if (angle == 90) {
    xTemp = xTemp+1
  }else if (angle == 180) {
    xTemp = xTemp+1
    yTemp = yTemp+1
  }else if (angle == 270) {
    yTemp = yTemp+1
  }

  var tmp = obtenirPositionAvecCoordonee(xTemp,yTemp,places[place])
  xTemp = tmp.x
  yTemp = tmp.y

  if (images[id] !== undefined){
    images[id] = {x:xTemp,y:yTemp,rot:angle,img:images[id].img,place:place}
    redraw()
  }else {
    loadImage("../static/pieces/domino"+id+".png", img => {
      images[id] = {x:xTemp,y:yTemp,rot:angle,img:img,place:place}
      redraw()
    })
  }


}
