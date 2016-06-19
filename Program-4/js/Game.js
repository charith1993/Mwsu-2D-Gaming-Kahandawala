

var skillLevel = new Object();
//3 differnt levels
skillLevel.easy = [10, 30];
skillLevel.medium = [30, 100];
skillLevel.hard = [100, 200];

var asteroidSize = 20;

var cursors;
var bullet;
var bullets;
var bulletTime = 0;
var numAsteroids;
var spawnTime = 0;

var SpaceHipster = SpaceHipster || {};

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
  create: function() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
      
  	//set world dimensions
    this.game.world.setBounds(0, 0, 1920, 1920);

    //background
    this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

    //create player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
    this.player.anchor.set(.5);
    this.player.animations.add('fly', [0, 1, 2, 3], 5, true);
    this.player.animations.play('fly');
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.drag.set(100);
    this.player.body.maxVelocity.set(200);
    
    //Create bullets
    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', .5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //player initial score of zero
    this.playerScore = 0;

    //enable player physics
    this.game.physics.arcade.enable(this.player);
    this.playerSpeed = 120;
    this.player.body.collideWorldBounds = true;

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //generate game elements
    this.generateCollectables();
    this.generateAsteriods();

    //show score
    this.showLabels();

    //sounds
    this.explosionSound = this.game.add.audio('explosion');
    console.log(this.explosionSound);
    this.collectSound = this.game.add.audio('collect');
      
    cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBOARD]);
  },
  update: function() {
    this.game.physics.arcade.collide(this.asteroids);  
    this.game.physics.arcade.overlap(bullets, this.asteroids, this.destroyAsteroid, null, this);
    /*if(this.game.input.activePointer.justPressed()) {
      
      //move on the direction of the input
      this.game.physics.arcade.moveToPointer(this.player, this.playerSpeed);
    }*/
    if(this.player.alive){
        if (cursors.up.isDown)
        {
            this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
        }
        else
        {
            this.player.body.acceleration.set(0);
        }

        if (cursors.left.isDown)
        {
            this.player.body.angularVelocity = -300;
        }
        else if (cursors.right.isDown)
        {
            this.player.body.angularVelocity = 300;
        }
        else
        {
            this.player.body.angularVelocity = 0;
        }

        if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        {
            this.fireBullet();
        }
    }
    //collision between player and asteroids
    this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);

    //overlapping between player and collectables
    this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
    
    //Sets a spawn rate for the asteroids
    if(this.asteroids.countLiving() < numAsteroids && this.game.time.now > spawnTime) {
        this.generateAsteroid();
        spawnTime = this.game.time.now + 1200;
    };
  },
  destroyAsteroid: function(bullet, asteroid) {
      //Reduces the asteroid's health by one each time a bullet collides with a asteroid
      //and kills the asteroid if it's health drops to 0
      asteroid.health -= 1;
      if(asteroid.health <= 0){
          var emitter = this.game.add.emitter(asteroid.x, asteroid.y, 100);
          emitter.makeParticles('playerParticle');
          emitter.minParticleSpeed.setTo(-200, -200);
          emitter.maxParticleSpeed.setTo(200, 200);
          emitter.gravity = 0;
          emitter.start(true, 1000, null, 100);
          asteroid.kill();
          
          var chance = [0,0,0,1,1,1,1,1,1,1];
          var rndChance = this.game.rnd.pick(chance);
          //Rewards the player for destroying asteroids
          //30% chance to spawn a collectable(s) based on size
          if(rndChance == 0) {
              if(asteroid.width <= 80) {
                    var location = [asteroid.body.x, asteroid.body.y];
                    this.generateCollectable(location);
              }
              else if(asteroid.width >= 81 && asteroid.width <= 120) {
                    var location = [asteroid.body.x - 10, asteroid.body.y];
                    this.generateCollectable(location);
                    location[0] += 20;
                    this.generateCollectable(location);
              }
              else {
                    var location = [asteroid.body.x, asteroid.body.y + 10];
                    this.generateCollectable(location);
                    location = [asteroid.body.x + 10, asteroid.body.y - 10];
                    this.generateCollectable(location);
                    var location = [asteroid.body.x - 10, asteroid.body.y - 10];
                    this.generateCollectable(location);
              }
          }
          //console.log(asteroid);
      }
      bullet.kill();
  },
  fireBullet: function() {
    if (this.game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(this.player.body.x + 16, this.player.body.y + 16);
            bullet.lifespan = 1850;
            bullet.rotation = this.player.rotation + 1.6;
            this.game.physics.arcade.velocityFromRotation(this.player.rotation, 450, bullet.body.velocity);
            bulletTime = this.game.time.now + 180;
        }
    }
  },
  generateCollectables: function() {
    this.collectables = this.game.add.group();

    //phaser's random number generator
    var numCollectables = this.game.rnd.integerInRange(40, 70)

    for (var i = 0; i < numCollectables; i++) {
        var collectableLocation = [this.game.world.randomX, this.game.world.randomY];
        this.generateCollectable(collectableLocation);
    }

  },
  generateAsteriods: function() {
    this.asteroids = this.game.add.group();
    
    //enable physics in them
    this.asteroids.enableBody = true;

    //phaser's random number generator
    numAsteroids = this.game.rnd.integerInRange(skillLevel.medium[0], skillLevel.medium[1]);
      
    for (var i = 0; i < numAsteroids; i++) {
      //add sprite
      this.generateAsteroid(); 
    }
    
  },
  hitAsteroid: function(player, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    this.player.kill();

    this.game.time.events.add(800, this.gameOver, this);
  },
  gameOver: function() {    
    //pass it the score as a parameter 
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },
  collect: function(player, collectable) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore++;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    collectable.destroy();
  },
  showLabels: function() {
    //score text
    var text = "0";
    var style = { font: "20px Arial", fill: "#fff", align: "center" };
    this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
  },
    
    generateAsteroid: function() {
        //Lets game pick a number randomly from this array
        //90% chance to get a small to medium sized asteroid
        //10% chance to get a large asteroid
        var size = [0,0,0,0,0,0,0,0,0,1]
        var smallSpeed = [110, 100, 90, 80, -110, -100, -90, -80];
        var mediumSpeed = [70, 60, 50, 40, -70, -60, -50, -40];
        var largeSpeed = [30, 20, 15, -30, -20, -15];
        
        var asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
        while((asteroid.x < this.player.x + 160 && asteroid.x > this.player.x - 160) || (asteroid.y < this.player.y + 160 && asteroid.y > this.player.y - 160)) {
            asteroid.x = this.game.world.randomX;
            asteroid.y = this.game.world.randomY;
        }
        
       // var random = new Phaser.RandomDataGenerator(this.game.time.now);
       //random.weightedPick(size);
        
        var asteroidSize = this.game.rnd.pick(size);
        if(asteroidSize == 0) {
            asteroid.scale.setTo(this.game.rnd.integerInRange(10, 25)/10);
        }
        else {
            asteroid.scale.setTo(this.game.rnd.integerInRange(26, 50)/10);
        }
        
        //Picks a speed based on the size of the asteroid randomly, as well as
        //gives health values based on size;
        if(asteroid.width <= 80) {
            asteroid.body.velocity.x = this.game.rnd.pick(smallSpeed);
            asteroid.body.velocity.y = this.game.rnd.pick(smallSpeed);
        }
        else if(asteroid.width >= 81 && asteroid.width <= 120) {
            asteroid.body.velocity.x = this.game.rnd.pick(mediumSpeed);
            asteroid.body.velocity.y = this.game.rnd.pick(mediumSpeed);
            asteroid.health = 3;
        }
        else {
            asteroid.body.velocity.x = this.game.rnd.pick(largeSpeed);
            asteroid.body.velocity.y = this.game.rnd.pick(largeSpeed);
            asteroid.health = 5
        }
        
        asteroid.body.collideWorldBounds = true; 
        asteroid.body.bounce.x = 1;
        asteroid.body.bounce.y = 1;  
        //console.log(asteroid);
    },
    generateCollectable: function(location) {

    //enable physics in them
    this.collectables.enableBody = true;
    this.collectables.physicsBodyType = Phaser.Physics.ARCADE;
    var collectable;

    //add sprite
    collectable = this.collectables.create(location[0], location[1], 'power');
    collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
    collectable.animations.play('fly');
  },
};
/*
TODO

-audio
-asteriod bounch
*/