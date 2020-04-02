$( document ).ready(function(){
  let tmp= window.location.href.split("/");
  pourRemplissage = tmp;
  while (nom == null || nom.trim()=="") {
    nom = window.prompt("Entrez votre pseudo","");
  }

  socket.emit('connectionJoueur',{pseudo:nom,salon:tmp[tmp.length-1]});
});
