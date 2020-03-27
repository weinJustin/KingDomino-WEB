// function removeElement(id) {
//     var elem = document.getElementById(id);
//     return elem.parentNode.removeChild(elem);
// }
//
 function placement(x,y,rot,id,place){
//   //on cherche la présence d'un domino de même id pour le suprimer si il existe
//   // console.log("x: "+x+"\ny: "+y+"\nrot: "+rot+"\nid: "+id+"\nplace: "+place);
//   var tmp = arborecence["domino"+id];
//   if (!tmp){
//     arborecence["domino"+id]=place;
//   }else {
//     removeElement("domino"+id);
//   }
//
//   var angle = 0;
//   angle = (rot * 90) ;
//   var c = document.getElementById(place);
//   var img = "<img class='domino' src='../static/pieces/domino"+id+".png' "+fonctionSup+"id='domino"+id+"'>";
//   $("#"+place).append(img);
//
  var xTemp = x;
  var yTemp = y
  if (angle == 90) {
    xTemp = x+1
  }else if (angle == 180) {
    xTemp = x+1
    yTemp = y+1
  }else if (angle == 270) {
    yTemp = y+1
  }
//
$("#domino"+id).css({"left":xTemp*20+"%","top":yTemp*20+"%",'transform':"rotate("+angle+"deg)"});
}
//
// function changerFeedBack(message){
//   console.log(document.getElementById("feedback"));
//   document.getElementById("feedback").innerHTML = message;
// }



function setup() {
  largeurCanevas = Math.floor(windowWidth-5)
  hauteurCanevas = Math.floor(windowHeight-4)
  // largeurCanevas = 1000
  // hauteurCanevas = 500
  tailleCasePrincipal = (hauteurCanevas/10)*3
  positionCasePrincipal = {x:(largeurCanevas/100)*5,y:(hauteurCanevas/100)*5}

  angleMode(DEGREES);
  rectMode(CORNER);

  createCanvas(largeurCanevas,hauteurCanevas);
  loop()
}

function draw() {
  background(220);
  fill(255);
  square(positionCasePrincipal.x, positionCasePrincipal.y, tailleCasePrincipal);
  if (intervalCase(mouseX,mouseY,positionCasePrincipal,tailleCasePrincipal)){
    caseTMP = obtenirCoordonee(mouseX,mouseY,tailleCasePrincipal,positionCasePrincipal)
    xCase = caseTMP.x * tailleCasePrincipal/5 + positionCasePrincipal.x
    yCase = caseTMP.y * tailleCasePrincipal/5 + positionCasePrincipal.y

    fill(100);
    square(xCase, yCase, tailleCasePrincipal/5);
  }

  for (var x in images) {
    loadImage(images[x].img, img => {
      var tmp = resizeTo(img.height,img.width,125,250)
      scale(tmp.h,tmp.l)
      translate(images[x].x, images[x].y)
      rotate(images[x].rot)
      image(img, 0,0);
      rotate(-images[x].rot)
    });
  }

}

function resizeTo(hauteur,largeur,hauteurCible,largeurCible){
  return {h:hauteurCible/hauteur,l:largeurCible/largeur}
}

function obtenirCoordonee(x,y,taille,coordonee,nbrCase=5){
  let resultX = Math.floor((x-coordonee.x)/Math.floor(taille/nbrCase))
  let resultY = Math.floor((y-coordonee.y)/Math.floor(taille/nbrCase))
  return {x:resultX,y:resultY}
}

function mousePressed() {
  if (intervalCase(mouseX,mouseY,positionCasePrincipal,tailleCasePrincipal)){
    var result = obtenirCoordonee(mouseX,mouseY,tailleCasePrincipal,positionCasePrincipal)
    console.log(result);
  }
  redraw()

}

function intervalCase(x,y,coordonee,taille){
  return x<coordonee.x+taille && y < coordonee.y+taille && x>coordonee.x && y > coordonee.y
}
