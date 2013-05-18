$(document).ready(function(){
var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d');
var keyboard = { };
var playerBullets = [];
var tick = 0;
var mtick = 0;
var points = 0;

//draw background
c.fillStyle = "black";
c.fillRect(0,0,1024,768);

var game = {
    state: "start",
};

//define ship
ship ={
  counter:0,
  s:15,
  r:75,
  x:512,
  y:384,
  z:15
};
  
var meteors = [];

var overlay = {
    counter: -1,
    title: "foo",
    subtitle: "bar",
  scoreTitle: "rable",
  score: "rabble",
};

var overlay2 = {
    counter: -1,
  scoreTitle: "SCORE:",
  score: points,
};

var mouse = {
    pos: {},
    down: false
};


 
canvas.addEventListener("click", function(){
    mouse.down = true;
}, false);
 
canvas.addEventListener("mousemove", function(evt){
    var pos = getMousePos(canvas, evt);
    mouse.pos.x = pos.x;
    mouse.pos.y = pos.y;
});
 
canvas.addEventListener("mouseout", function(evt){
    mouse.pos = {};
});

loadResources();
doSetup();
setInterval(mainLoop,1000/30);

function loadResources() {
  ship_image = new Image();
  ship_image.src = "images/Spaceship2.png";
  
  meteor1_image = new Image();
  meteor1_image.src = "images/meteor2.png";
  
  explosion_image = new Image();
  explosion_image.src = "images/explosion.png";
  
  //Sound resources
  gun = new Audio("sound/shoot.wav");
  asteroid = new Audio("sound/asteroid.wav");
  splosion = new Audio("sound/ship.wav");

}

function mainLoop() {
  var c = canvas.getContext('2d');
  
  updateGame();
  getDirection();
  updateMovement();
  collision();
  updatePlayerBullets();
  
  clearCanvas(c);
  drawMeteors(c);
  drawShip(c);
  drawScore(c);
  drawOverlay(c);
  drawPlayerBullets(c);
};

function updateGame() {

  if((game.state == "over" || game.state == "won") && keyboard[32]) {
    game.state = "start";
    ship.state = "alive";
    overlay.counter = -1;
    meteors = [];
    points = 0;
    overlay2.score = points;
  }
  
  if(overlay.counter >= 0) {
    overlay.counter++;
  }
};

setInterval(function(){
  s=Math.random();
  t=Math.random();
    var meteor ={
      dir:Math.floor(Math.random()*360),
      s:Math.random(),
      //r:Math.floor((15-12+1)*Math.random()+12),
      r:15,
      x:2048 * Math.cos(s) * Math.sin(t) -512,
      y:2048 * Math.sin(s) * Math.sin(t)-631,
      z:1024 * Math.cos(t)
    };
    meteors.push(meteor);
    meteors.sort(function (a, b) {
        return a.z < b.z;
    });

},40);

function doSetup() {
  attachEvent(document, "keydown", function(e) {
    keyboard[e.keyCode] = true;
  });
  attachEvent(document, "keyup", function(e) {
    keyboard[e.keyCode] = false;
  });
};

function attachEvent(node,name,func) {
  if(node.addEventListener) {
      node.addEventListener(name,func,false);
  } else if(node.attachEvent) {
      node.attachEvent(name,func);
  }
};






function firePlayerBullet() {
  //create a new bullet
  playerBullets.push({
    x: ship.x,
    y: ship.y - 5,
    width:10,
    height:10,
    mx: mouse.pos.x,
    my: mouse.pos.y,
  });
  //Play laser sound when bullet is fired
  gun.currentTime=0;
  gun.play();
};

// check for player colliding with meteor
function collision(){
  if(ship.state == "hit" || ship.state == "dead") return;
  for(var i in meteors) {
    var meteor = meteors[i];
    xsqr = Math.pow(ship.x - meteor.x,2);
    ysqr = Math.pow(ship.y - meteor.y,2);
    zsqr = Math.pow(ship.z - meteor.z,2);
    dis = Math.sqrt(xsqr + ysqr + zsqr)-ship.r-meteor.r;
    if (dis <= 0) {
      ship.state= "hit";
    name = '<?php echo $_GET["name"]; ?>';
    score = points;
    }
  };
};



var dirKeys = {
    'left' : [37, 65],
    'right' : [39, 68],
    'up':[38, 87],
    'down':[40, 83]
};

function getDirection(){
  ship.dirx = false;
  ship.diry = false;
  $.each(dirKeys, function(key, value){
    $.each(value, function(i, k){
      if(keyboard[k]){
        if(key == 'left'){
          ship.dirx = -1; 
        }
        if(key == 'right'){
          ship.dirx = 1; 
        }
        if(key == 'up'){
          ship.diry = -1; 
        }
        if(key == 'down'){
          ship.diry = 1; 
        }
      }
    });
  });
}

function updateMovement(){
  
  if(ship.state == "hit") {
    ship.counter++;

    if(ship.counter >= 40) {
      endGame();
    };
  };
  
  if (ship.dirx || ship.diry){
    angleturned = ship.s/100;
    xTraveled = 50 * Math.cos(angleturned);
    zTraveled = 50 * Math.sin(angleturned);

    for(var i in meteors) {
      var meteor = meteors[i];
      meteorhypo = Math.sqrt( (meteor.z - zTraveled)^2 + xTraveled^2 );
      meteorangle = 90-(angleturned - Math.asin(zTraveled/meteorhypo));
      
      meteor.z = meteor.z - Math.sin(meteorangle)*meteorhypo;
      meteor.r += (102.4/meteor.z);

      if(ship.dirx){
        meteor.x += ((Math.cos(meteorangle)*meteorhypo/1.33)+((meteor.x-512)/meteor.z)+ (meteor.s * ship.s * Math.cos(meteor.dir))) * ship.dirx;
      } else{
        meteor.x += ((meteor.x-512)/meteor.z)+ (meteor.s * ship.s * Math.cos(meteor.dir));
      }
      if(ship.diry){
        meteor.y += ((Math.cos(meteorangle)*meteorhypo/1.33)+((meteor.y-384)/meteor.z)+ (meteor.s * ship.s * Math.sin(meteor.dir))) * ship.diry;
      } else {
        meteor.y += ((meteor.y-384)/meteor.z)+ (meteor.s * ship.s * Math.sin(meteor.dir));
      }
    };

    if(ship.dirx){
      if (ship.x > 387 && ship.x < 687){
        ship.x += 5 * ship.dirx;
      };
    }
    if(ship.diry){
      if (ship.y > 287 && ship.y < 487){
        ship.y += 5/1.33 * ship.diry;
      };
    }
    
  }else{
    for(var i in meteors) {
      var meteor = meteors[i];
      meteor.z -= (meteor.s * ship.s);
      meteor.r += (102.4/meteor.z);
      meteor.x += ((meteor.x-512)/meteor.z) + (meteor.s * ship.s * Math.cos(meteor.dir));
      meteor.y += ((meteor.y-384)/meteor.z) + (meteor.s * ship.s * Math.sin(meteor.dir));
      if (meteor.z < -500){
        $(meteor).remove();
      }
    };
    if (ship.x != 512){
      ship.x += (512-ship.x)/20;
    }
    if (ship.y != 384){
      ship.y += (384-ship.y)/20;
    }
  };
  if(mouse.down) {
    
    firePlayerBullet();
    mouse.down = false;
    
  };
};

function getMousePos(canvas, evt){
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while (obj.tagName != 'BODY') {
      top += obj.offsetTop;
      left += obj.offsetLeft;
      obj = obj.offsetParent;
    }
 
    // return relative mouse position
    var mouseX = evt.clientX - left + window.pageXOffset;
    var mouseY = evt.clientY - top + window.pageYOffset;
    return {
      x: mouseX,
      y: mouseY
    };
};

function updatePlayerBullets() {
    
  //move each bullet
  for(i in playerBullets) {
    var bullet = playerBullets[i];
    var DistX = bullet.mx - bullet.x;
    var DistY = bullet.my - bullet.y;
    bullet.x += 40 * (DistX / (Math.abs(DistX) + Math.abs(DistY)));
    bullet.y += 40 * (DistY / (Math.abs(DistX) + Math.abs(DistY)));
    
    var distance = Math.sqrt(DistX ^ 2 + DistY ^ 2);
  
    if((DistY < 0 && bullet.y < bullet.my) ||
      (DistY > 0 && bullet.y > bullet.my) ||
      (DistX < 0 && bullet.x < bullet.mx) ||
      (DistX > 0 && bullet.x > bullet.mx)
      ){
        playerBullets.splice(i, 1);
      };

    updateMeteorCollision(bullet.x, bullet.y);
    bullet.counter++;
  };
//remove the ones that are off the screen

};

function updateMeteorCollision(x, y) {
  for(var i in meteors) {
    var meteor = meteors[i];
    xsqr = Math.pow(x - meteor.x,2);
    ysqr = Math.pow(y - meteor.y,2);
    dis = Math.sqrt(xsqr + ysqr)-meteor.r;
    if (dis <= 0) {
      meteors.splice(i, 1);
      drawMeteorExplosion(x,y);
      points += 10;
      overlay2.score = points;
    }
  };
};






function clearCanvas(c){
  c.fillStyle = "black";
  c.fillRect(0,0,1024,768);
};


function drawShip(c){
  if(ship.state == "dead") return;
    
  if(ship.state == "hit") {
    drawShipExplosion(c);
    return;
  };

  var shipimage = {};
  shipimage.y = ship.y-45;
  shipimage.x = ship.x-72;
  var img = [864, 720, 576, 432, 288, 144, 0];
  var spritePos = 864;
  for(var i in img) {
    if ((687 - (50*i)) >= ship.x){
      spritePos = img[i];
    }
  }

  c.drawImage(ship_image,
    spritePos,0,144,90,
    shipimage.x, shipimage.y, 144,90 
  );
};

function drawPlayerBullets(c) {
  c.fillStyle = "blue";
  for(i in playerBullets) {
    var bullet = playerBullets[i];
    c.fillRect(bullet.x, bullet.y, bullet.width,bullet.height);
  };
};

function drawMeteors(c){
  for(var i in meteors) {
    var meteor = meteors[i];
    var v = Math.floor(255- meteor.z/4);
    if ((meteor.z > 0) && (meteor.x > -50) && (meteor.x < 1074) && (meteor.y > -50) && (meteor.y < 826)){
      c.moveTo(meteor.x,meteor.y);
      var count = Math.floor(meteors.length/1.5);
      var xoff = (count%4)*72;

      c.drawImage(
      meteor1_image,
      xoff+0,0,72,72,
      meteor.x,meteor.y,meteor.r*2,meteor.r*2
    );
    };
  };
};

var particles = [];
function drawShipExplosion(c) {
  //Play explosion sound when bhit
  splosion.play();
  //start
  if(ship.counter == 0) {
    particles = []; //clear any old values
    for(var i = 0; i<50; i++) {
      particles.push({
        x: ship.x,
        y: ship.y,
        xv: (Math.random()-0.5)*2.0*5.0,  // x velocity
        yv: (Math.random()-0.5)*2.0*5.0,  // y velocity
        age: 0,
      });
    };
    function drawBoom(){
      var frame = tick % 16; //7 is the number of frames in the sprite sheet
      var x3 = frame * 64; //48 is the width of each frame
      c.drawImage(
        explosion_image, // the image of the sprite sheet
        x3,0,64,62, // source coords inside sheet (x,y,w,h)
        (ship.x-32),(ship.y-31),64,62 // destination coordinates on canvas (x,y,w,h)
      );
      tick++;
    };
    var intervalBoom = setInterval(drawBoom,1000/30);
    setTimeout(function() { clearInterval(intervalBoom)}, 480);
  };
  
  if(ship.counter > 0) {
    for(var i=0; i<particles.length; i++) {
      var p = particles[i];
      p.x += p.xv;
      p.y += p.yv;
      var v = 255-p.age*3;
      c.fillStyle = "rgb("+v+","+v+","+v+")";
      c.fillRect(p.x,p.y,3,3);
      p.age++;
    };
  };
};

function drawMeteorExplosion(x,y) {
    asteroid.currentTime = 0;
    asteroid.play();
  //start
  if(ship.counter == 0) {
    particles = []; //clear any old values
    for(var i = 0; i<50; i++) {
      particles.push({
        x: x,
        y: y,
        xv: (Math.random()-0.5)*2.0*5.0,  // x velocity
        yv: (Math.random()-0.5)*2.0*5.0,  // y velocity
        age: 0,
      });
    };
    function drawMeteorBoom(){
      var frame = mtick % 16; //7 is the number of frames in the sprite sheet
      var x3 = frame * 64; //48 is the width of each frame
      c.drawImage(
        explosion_image, // the image of the sprite sheet
        x3,0,64,62, // source coords inside sheet (x,y,w,h)
        (x-32),(y-31),64,62 // destination coordinates on canvas (x,y,w,h)
      );
      mtick++;
    };
    var intervalMeteorBoom = setInterval(drawMeteorBoom,1000/30);
    setTimeout(function() { clearInterval(intervalMeteorBoom)}, 480);
  };
};

function drawScore(c) {
  
  c.save();
  c.fillStyle = "rgb(255,255,255)";
  c.font = "14pt Arial";
  c.fillText(overlay2.scoreTitle, 940,730);
  c.font = "14pt Arial";
  c.fillText(overlay2.score, 970,750);
  c.restore();
};

function drawOverlay(c) {
  if(overlay.counter == -1) return;
    
  var alpha = overlay.counter/50.0;
  if(alpha > 1) alpha = 1;
    
  c.save();
  c.fillStyle = "rgba(255,255,255,"+alpha+")";
  c.font = "Bold 40pt Michroma";
  c.fillText(overlay.title,280,60);
  c.font = "14pt Michroma";
  c.fillText(overlay.subtitle, 360,110);
  c.fillText(overlay.scoreTitle, 415,160);
  c.fillText(overlay.score, 535,160);
  c.restore();
};

function endGame(){
  //game score screen
  $.post('post_score.php', {Name: name, Score: points},function(data){
    $("#overlay").html(data);
  });//end .post
  //end game score screen
  ship.counter = 0;
  ship.state = "dead";
  game.state = "over";
  overlay.title = "GAME OVER";
  overlay.subtitle = "press space to play again";
  overlay.scoreTitle = "SCORE:";
  overlay.score = points;
  overlay.counter = 0;
  points = 0;
  overlay2.score = points;
}

});