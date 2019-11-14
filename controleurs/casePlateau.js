function trowId(balise){
  var arrayBrut = balise.id.split("");
  var result = {'x':arrayBrut[4],'y':arrayBrut[5]};
  console.log(result);
  return result;
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
      $("div.plateau").append(div);
      $("#"+id).css({"left":i*20+"%","top":j*20+"%"});
    }
  }
});
