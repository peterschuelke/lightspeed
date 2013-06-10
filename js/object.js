function game(){
  var self = this;
  var canvas = document.getElementById('canvas');
  var c = canvas.getContext('2d');
  var keyboard = { };
  
  
  var particles = [];
  var game = {};
  game.tick = 0;
  game.points = 0;
  game.overlay = {
        counter: -1,
        title: "foo",
        subtitle: "bar",
        scoreTitle: "SCORE:",
        score: 0,
      };

  var mouse = {
        pos: {},
        down: false
      };

  canvas.addEventListener("click", function(){
    mouse.down = true;
  }, false);
   
  canvas.addEventListener("mousemove", function(evt){
    var pos = self.getMousePos(canvas, evt);
    mouse.pos.x = pos.x;
    mouse.pos.y = pos.y;
  });
   
  canvas.addEventListener("mouseout", function(evt){
    mouse.pos = {};
  });

  function setup() {
    self.attachEvent(document, "keydown", function(e) {
      keyboard[e.keyCode] = true;
    });
    self.attachEvent(document, "keyup", function(e) {
      keyboard[e.keyCode] = false;
    });
    self.loadResources();
    self.setProperites();
  };

  this.attachEvent = function(node,name,func) {
    if(node.addEventListener) {
      node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
      node.attachEvent(name,func);
    }
  };

  this.loadResources = function(){
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

  this.setProperites = function(){
    self.state = "start";
    ship = new ship(mouse, keyboard, meteorField, game);
    meteorField = new meteorField(ship, c, game);
    drawCanvas = new drawCanvas(ship, meteorField, c, game)
    game.overlay.counter = -1;
    game.points = 0;
    // overlayEnd.score = points;
    $('#overlay').hide();
  }

  this.gameState = function(){
    if((self.state == "over" || self.state == "won") && keyboard[32]) {
      //console.log('reset');
      self.setProperites();
    }
    if (ship.state == 'hit'){
      name = '<?php echo $_GET["name"]; ?>';
      game.score = game.points;
      ship.counter++;

      if(ship.counter >= 40) {
        self.end();
      };
    }
    
    if(game.overlay.counter >= 0) {
      game.overlay.counter++;
    }
  }

  this.getMousePos = function(canvas,evt){
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
  }

  function gameLoop() {
    self.gameState();
    ship.updateMovement(mouse, keyboard);
    meteorField.updateMovement(ship, c);
    drawCanvas.drawLoop(ship, meteorField, c);
  };

  this.end = function(){
    //game score screen
    $.post('post_score.php', {Name: name, Score: game.points},function(data){
      $("#overlay").html(data);
    });//end .post
    //end game score screen
    ship.counter = 0;
    ship.state = "dead";
    self.state = "over";
    game.overlay.title = "GAME OVER";
    game.overlay.subtitle = "press space to play again";
    game.overlay.scoreTitle = "SCORE:";
    game.overlay.score = game.points;
    game.overlay.counter = 0;
    game.points = 0;
    // overlayEnd.score = points;
  }
  setup();
  setInterval(gameLoop,1000/30);
}


function ship(mouse, keyboard, game){
  var self = this;
	this.counter = 0;
  this.s = 15;
  this.r = 75;
  this.x = 512;
  this.y = 384;
  this.z = 15;
  this.state = "alive";
  this.dirKeys = {
    'left' : [37, 65],
    'right' : [39, 68],
    'up':[38, 87],
    'down':[40, 83]
  }
  this.dirx = 0;
  this.diry = 0;
  this.bullets = [];

  this.direction = function(){
    self.dirx = false;
    self.diry = false;
    $.each(self.dirKeys, function(key, value){
      $.each(value, function(i, k){
        if(keyboard[k]){
          if(key == 'left'){
            self.dirx = -1; 
          }
          if(key == 'right'){
            self.dirx = 1; 
          }
          if(key == 'up'){
            self.diry = -1; 
          }
          if(key == 'down'){
            self.diry = 1; 
          }
        }
      });
    });
  } 

  this.updateMovement = function(){
    self.direction();
    if(self.state == "hit") {
      return;
    }
    
    if (self.dirx || self.diry){
      angleturned = self.s/100;
      xTraveled = 50 * Math.cos(angleturned);
      zTraveled = 50 * Math.sin(angleturned);

      if(self.dirx){
        if (self.x > 387 && self.x < 687){
          self.x += 5 * self.dirx;
        }
      }
      if(self.diry){
        if (self.y > 287 && self.y < 487){
          self.y += 5/1.33 * self.diry;
        }
      }
      
    }else{

      if (self.x != 512){
        self.x += (512-self.x)/20;
      }
      if (this.y != 384){
        self.y += (384-self.y)/20;
      }
    }
    if(mouse.down) {
      self.fireBullets();
      mouse.down = false;
    }
    if(self.bullets.length > 0){
      self.updateBullets();
    }
  }
  this.fireBullets = function(){
    if(self.state == "hit" || self.state == "dead") return;
    //create a new bullet
    self.bullets.push({
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
  }
  this.updateBullets = function(){
    //move each bullet
    for(i in self.bullets) {
      var bullet = self.bullets[i];
      var DistX = bullet.mx - bullet.x;
      var DistY = bullet.my - bullet.y;
      bullet.x += 40 * (DistX / (Math.abs(DistX) + Math.abs(DistY)));
      bullet.y += 40 * (DistY / (Math.abs(DistX) + Math.abs(DistY)));
    
      if((DistY < 0 && bullet.y < bullet.my) ||
        (DistY > 0 && bullet.y > bullet.my) ||
        (DistX < 0 && bullet.x < bullet.mx) ||
        (DistX > 0 && bullet.x > bullet.mx)
        ){
          self.bullets.splice(i, 1);
        };

      meteorField.meteorExplosion(bullet.x, bullet.y);
      bullet.counter++;
    };
  }
}

function meteor(){
  s = Math.random();
  t = Math.random();

  this.dir = Math.floor(Math.random()*360);
  this.s = Math.random();
  this.r = 15;
  this.x = 2048 * Math.cos(s) * Math.sin(t) -512;
  this.y = 2048 * Math.sin(s) * Math.sin(t)-631;
  this.z = 1024 * Math.cos(t);

  return this;
};

function meteorField(ship, c, game){
  var self = this;
  this.meteors = new Array();

  this.addMeteor = function() {
    self.meteors.push(new meteor());
    self.meteors.sort(function (a, b) {
      return a.z < b.z;
    });
  }
  setInterval(function(){
    self.addMeteor();
  },40);

  this.updateMovement = function(){

    if (ship.dirx || ship.diry){
      angleturned = ship.s/100;
      xTraveled = 50 * Math.cos(angleturned);
      zTraveled = 50 * Math.sin(angleturned);

      for(var i in self.meteors) {
        var meteor = self.meteors[i];
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
      }
      
    }else{
      for(var i in self.meteors) {
        var meteor = self.meteors[i];
        meteor.z -= (meteor.s * ship.s);
        meteor.r += (102.4/meteor.z);
        meteor.x += ((meteor.x-512)/meteor.z) + (meteor.s * ship.s * Math.cos(meteor.dir));
        meteor.y += ((meteor.y-384)/meteor.z) + (meteor.s * ship.s * Math.sin(meteor.dir));
        if (meteor.z < -500){
          $(meteor).remove();
        }
      };
    }
    self.meteorCollision();
  }
  this.meteorCollision = function(){
    if(ship.state == "hit" || ship.state == "dead") return;

    for(var i in meteorField.meteors) {
      var meteor = meteorField.meteors[i];
      var xsqr = Math.pow(ship.x - meteor.x,2);
      var ysqr = Math.pow(ship.y - meteor.y,2);
      var zsqr = Math.pow(ship.z - meteor.z,2);
      var dis = Math.sqrt(xsqr + ysqr + zsqr)-ship.r-meteor.r;
      if (dis <= 0) {
        ship.state = "hit";
      }
    };
  }
  this.meteorExplosion = function(x, y){
    for(var i in meteorField.meteors) {
      var meteor = meteorField.meteors[i];
      xsqr = Math.pow(x - meteor.x,2);
      ysqr = Math.pow(y - meteor.y,2);
      dis = Math.sqrt(xsqr + ysqr)-meteor.r;
      if (dis <= 0) {
        console.log('hit');
        meteorField.meteors.splice(i, 1);
        //drawMeteorExplosion(x,y);
        drawCanvas.drawExplosion(c, 'meteor', x, y);
        game.points += 10;
        game.overlay.score = game.points;
      }
    };
  }
}

function drawCanvas(ship, meteorField, c, game){
  var self = this;
  this.drawLoop = function(){
    self.clearCanvas();
    self.drawMeteors();
    self.drawBullets();
    self.drawShip();
    self.drawScore();
    self.drawOverlay();
  }
  this.clearCanvas = function(){
    //draw background
    c.fillStyle = "black";
    c.fillRect(0,0,1024,768);
  }
  this.drawMeteors = function(){

    for(var i in meteorField.meteors) {
      var meteor = meteorField.meteors[i];

      if ((meteor.z > 0) && (meteor.x > -50) && (meteor.x < 1074) && (meteor.y > -50) && (meteor.y < 826)){
        c.moveTo(meteor.x,meteor.y);
        var count = Math.floor(meteorField.meteors.length/1.5);
        var xoff = (count%4)*72;

        c.drawImage(
          meteor1_image,
          xoff+0,0,72,72,
          meteor.x,meteor.y,meteor.r*2,meteor.r*2
        );
      };
    };
  }

  this.drawBullets = function(){
    c.fillStyle = "blue";
    for(i in ship.bullets) {
      var bullet = ship.bullets[i];
      c.fillRect(bullet.x, bullet.y, bullet.width,bullet.height);
    };
  }

  this.drawShip = function(){
    if(ship.state == "dead") return;
    
    if(ship.state == "hit") {
      self.drawExplosion(c, 'ship', ship.x, ship.y);
      //drawShipExplosion(c);
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
  }

  this.drawExplosion = function(c, entity, x, y){
    console.log('explosion');
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
    };
    //Play explosion sound when hit
    if (entity == 'meteor'){
      asteroid.currentTime = 0;
      asteroid.play();
      var intervalBoom = setInterval(drawBoom,1000/30);
      setTimeout(function() { clearInterval(intervalBoom)}, 480);
    }
    if (entity == 'ship'){
      splosion.play();

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
        var intervalBoom = setInterval(drawBoom,1000/30);
        setTimeout(function() { clearInterval(intervalBoom)}, 480);
      };
    }
    function drawBoom(){
      var frame = game.tick % 16; //7 is the number of frames in the sprite sheet
      var x3 = frame * 64; //48 is the width of each frame
      c.drawImage(
        explosion_image, // the image of the sprite sheet
        x3,0,64,62, // source coords inside sheet (x,y,w,h)
        x,y,64,62 // destination coordinates on canvas (x,y,w,h)
      );
      game.tick++;
    };
  }
  this.drawScore = function(){
    c.save();
    c.fillStyle = "rgb(255,255,255)";
    c.font = "14pt Arial";
    c.fillText(game.overlay.scoreTitle, 940,730);
    c.fillText(game.overlay.score, 970,750);
    c.restore();
  }
  this.drawOverlay = function(){
    if(game.overlay.counter == -1) return;
    
    var alpha = game.overlay.counter/50.0;
    if(alpha > 1) alpha = 1;
      
    c.save();
    c.fillStyle = "rgba(255,255,255,"+alpha+")";
    c.font = "Bold 40pt Michroma";
    c.fillText(game.overlay.title,280,60);
    c.font = "14pt Michroma";
    c.fillText(game.overlay.subtitle, 360,110);
    c.fillText(game.overlay.scoreTitle, 415,160);
    c.fillText(game.overlay.score, 535,160);
    c.restore();
  }
}

