var monTour = false;
var dernierCoupEnvoyer = -1;
var dernierPlacement = 0;
var choix =[];
var faireChoix = false;
var dernierTour = false;
var nom = null;
var orientation = 0;
var premiertour = true;
var dernierChoixRenduInerte = 0;
var listeJoueur = {}


// variable d'affichage
let largeurCanevas = null
let hauteurCanevas = null

let placable = {}

let hPourcent = null
let lPourcent = null
let marge = 5

let xCase = null
let yCase = null

let couleur = [["#e6e600","#ffff66",'I'],["#99e699","#c1f0c1",'V'],["#ff6666","#ff9999",'R'],["#4d79ff","#809fff",'B']]
let maCouleur = '#e7d8cb';
let maCouleurClaire = '#d7bea8' ;
