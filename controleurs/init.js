$( document ).ready(function(){
  while (nom == null || nom.trim()=="") {
    nom = window.prompt("Entrez votre pseudo","");
  }
  socket.emit('connectionJoueur',nom);
});
