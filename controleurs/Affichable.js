let affichable = class Affichable {
  constructor(x,y,o,taille,ratio,type,nbrCase,color=null,image=null,choisi=false) {
    this.x = x
    this.y = y
    this.o = o
    this.taille = taille
    this.taille1Case = taille/nbrCase
    this.ratio = ratio
    this.type = type
    this.nbrCase = nbrCase
    this.color = color
    this.image = image
    this.choisi = choisi
  }
}
