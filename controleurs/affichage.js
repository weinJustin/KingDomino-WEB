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
  places['principal'].dernierDomPlace = null
  places['principal'].color = maCouleur

  places['principal']= new Affichable(hPourcent*50)

  places['fini'] = {}
  places['fini'].taille = hPourcent*5
  places['fini'].x = lPourcent*marge + lPourcent*2 + places['principal'].taille
  places['fini'].y = hPourcent*marge
  places['fini'].taille1Case = places['fini'].taille
  places['fini'].type = "fini"
  places['fini'].dernierDomPlace = null
  places['fini'].color = maCouleur


  for (var i = 0; i < 3; i++) {
    var nom = 'adv'+i
    places[nom] = {}
    places[nom].taille = hPourcent*35
    places[nom].x =(30*lPourcent)*i + lPourcent*marge
    places[nom].y = places['principal'].taille + (hPourcent*marge*2)
    places[nom].taille1Case = (places[nom].taille)/5
    places[nom].type = "jeu"
    places[nom].dernierDomPlace = null
    places[nom].color = maCouleur

  }

    tab = ["domPris","domChoi"];
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 4; j++) {
        var id = tab[i]+(j+1);
        places[id] = {}
        places[id].taille = hPourcent*10
        places[id].x = (lPourcent* i*20 )+ (lPourcent*50)
        places[id].y = (hPourcent* j*13) + (hPourcent*5)
        places[id].taille1Case = (places[id].taille)
        places[id].type = "col"
        places[id].dernierDomPlace = null
        places[id].color = maCouleur

      }
    }

  angleMode(DEGREES);
  rectMode(CORNER);

  createCanvas(largeurCanevas,hauteurCanevas);
  loop()
}

function draw() {

  background(220);
  for (var x in places) {
    fill(places[x].color);
    if (places[x].type == "col" || places[x].type == "fini"){
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
      var facteurTaille= null
      if(x.startsWith("Depart") || x.startsWith("king")){
        facteurTaille = resizeTo(images[x].img.height,images[x].img.width,taille1case,taille1case)
      }else {
        facteurTaille = resizeTo(images[x].img.height,images[x].img.width,taille1case,taille1case*2)
      }
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
    images[id] = {x:xTemp,y:yTemp,rot:angle,img:images[id].img,place:place,id:id,choisi:images[id].choisi}
    places[place].dernierDomPlace = id
    redraw()
  }else {
    loadImage("../static/pieces/domino"+id+".png", img => {
      images[id] = {x:xTemp,y:yTemp,rot:angle,img:img,place:place,id:id,choisi:false}
      places[place].dernierDomPlace = id
      redraw()
    })
  }


}

function placementCentre(imgNom,place){
    var xTemp = places[place].taille/2 + places[place].x
    var yTemp =  places[place].y


    if (images[imgNom] !== undefined){
      images[imgNom] = {x:xTemp,y:yTemp,rot:0,img:images[imgNom].img,place:place,id:imgNom,choisi:true}
      redraw()
    }else {
      loadImage("../static/"+imgNom+".png", img => {
        images[imgNom] = {x:xTemp,y:yTemp,rot:0,img:img,place:place,id:imgNom,choisi:true}
        redraw()
      })
    }
}
