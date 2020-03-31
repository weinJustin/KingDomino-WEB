function obtenirCoordonee(x,y,emplacement,nbrCase=5){
  var tailleUneCase = emplacement.taille/nbrCase
  let resultX = Math.floor((x-emplacement.x)/emplacement.taille1Case)
  let resultY = Math.floor((y-emplacement.y)/emplacement.taille1Case)
  return {x:resultX,y:resultY}
}

function obtenirPositionAvecCoordonee(x,y,emplacement,nbrCase=5){

  let resultX = (x * emplacement.taille1Case) + emplacement.x
  let resultY = (y * emplacement.taille1Case) + emplacement.y
  return {x:resultX,y:resultY}
}

function intervalCase(x,y,emplacement){
  if(emplacement.type == "col" || emplacement.type == "fini"){
    return x<emplacement.x+emplacement.taille*2 && y < emplacement.y+emplacement.taille && x > emplacement.x && y > emplacement.y
  }else {
    return x<emplacement.x+emplacement.taille && y < emplacement.y+emplacement.taille && x > emplacement.x && y > emplacement.y
  }
}

function recupImageFromBalise(nom){
  var tmp = null
  for (var x in images) {
    if (images[x].place == nom) {
      tmp = images[x]
      break;
    }
  }
  return tmp
}
