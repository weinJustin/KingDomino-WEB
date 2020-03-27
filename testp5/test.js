let largeurCanevas = null
let hauteurCanevas = null
let taille = 250
let xCase = 50
let yCase = 50

function setup() {
  largeurCanevas = windowWidth-20
  hauteurCanevas = windowHeight-20
  createCanvas(largeurCanevas,hauteurCanevas);
  loop()
}

function draw() {
  xCase = 50 *Math.floor(mouseX/50);
  yCase = 50 *Math.floor(mouseY/50);
  background(220);
  // rectMode(CENTER);
  rectMode(CORNER);
  fill(255);
  rect(50, 50, 250, 250);
  if (xCase<=250 && yCase <=250 && xCase>=50 && yCase >=50 ){
    fill(100);

    rect(xCase, yCase, taille/5, taille/5);

  }
}

function mousePressed() {
  var result = {x:Math.floor(mouseX/50)-1,y:Math.floor(mouseY/50)-1}

  console.log(result);
}
