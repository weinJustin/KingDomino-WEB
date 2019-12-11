function removeElement(id) {
    var elem = document.getElementById(id);
    return elem.parentNode.removeChild(elem);
}

function placement(x,y,rot,id,place,fonctionSup=""){
  //on cherche la présence d'un domino de même id pour le suprimer si il existe
  var tmp = arborecence["domino"+id];
  if (!tmp){
    arborecence["domino"+id]=place;
  }else {
    removeElement("domino"+id);
  }

  var angle = 0;
  angle = (rot * 90) ;
  var c = document.getElementById(place);
  var img = "<img class='domino' src='../static/pieces/domino"+id+".png' "+fonctionSup+"id='domino"+id+"'>";
  $("#"+place).append(img);

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

  $("#domino"+id).css({"left":xTemp*20+"%","top":yTemp*20+"%",'transform':"rotate("+angle+"deg)"});
}
