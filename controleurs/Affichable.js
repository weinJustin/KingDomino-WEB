let Affichable = class  {
  constructor(x,y,o,taille,ratio,nbrCase) {
    this.x = x
    this.y = y
    this.o = o
    this.taille = taille
    this.taille1Case = taille/nbrCase
    this.ratio = ratio
    this.nbrCase = nbrCase
    this.choisi = true
    this.visible = true

    this.color = null
    this.img = null
    this.place = null
    this.dernierDomPlace = null
    this.id = null
    this.text = null
  }
}
