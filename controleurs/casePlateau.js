// function trowId(){
//   if(monTour){
//     monTour = false;
//     var arrayBrut = dernierPlacement.id.split("");
//     //format normalisé : {x,y,orientation,id domino,nom joueur}
//     var result = {'x':Number(arrayBrut[4]),'y':Number(arrayBrut[5]),'o':Number(orientation),'id':Number(choix[0]),'joueur':nom};
//     dernierCoupEnvoyer = choix[0];
//     choix.shift();
//     socket.emit('jouer',result);
//   }
// }
//
// function placerSurGrille(balise){
//   if(monTour){
//     dernierPlacement = balise;
//     var arrayBrut = dernierPlacement.id.split("");
//     placement(Number(arrayBrut[4]),Number(arrayBrut[5]),orientation,choix[0],'adv1');
//   }
//
// }
//
// function rotation(direction){
//   if(monTour){
//     if (direction == 'h'){
//       orientation ++;
//     }else if (direction == 'ah') {
//       orientation --;
//     }
//
//     if (orientation>3) {
//       orientation = 0
//     }
//     if (orientation<0) {
//       orientation = 3
//     }
//     var arrayBrut = dernierPlacement.id.split("");
//     // console.log("x: "+arrayBrut[4]+"\ny: "+arrayBrut[5]+"\nrot: "+orientation+"\nid: "+choix[0]+"\nplace: adv1");
//     placement(Number(arrayBrut[4]),Number(arrayBrut[5]),orientation,choix[0],'adv1');
//   }
//
// }
//
// function finDePartie() {
//   socket.emit('finDePartie');
//
// }
//
// function choisir(balise){
//   if(faireChoix){
//     faireChoix =false;
//     var tmp = Number(balise.id.substr(6));
//     // console.log(balise.id);
//     // console.log(tmp);
//     choix.push(tmp);
//     dernierChoixRenduInerte = balise.parentNode.id ;
//     // placement(0,0,0,tmp,dernierChoixRenduInerte)
//     balise.onclick = null
//     socket.emit('choisir',choix[choix.length - 1]);
//     if(!premiertour){
//       monTour = true;
//       changerFeedBack("C'est votre tour. Placer votre domino");
//     }else{
//       premiertour = false;
//     }
//   }
// }
//
