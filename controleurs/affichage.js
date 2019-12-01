function placement(x,y,rot,id,place){
  var angle = 0;
  angle = (rot * 90) ;
  var c = document.getElementById(place);
  var img = "<img class='domino' src='../static/pieces/domino"+id+".png' id='domino"+id+"'>";
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
