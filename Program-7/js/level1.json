var level1State = {
    create: function() { 
        this.jumpSound = game.add.audio('jump');
        this.coinSound = game.add.audio('coin');
        this.deadSound = game.add.audio('dead');
        
        if(!game.device.desktop) {
            this.addMobileInputs();
        }
        
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);
        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        }
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.player = game.add.sprite(game.width/2, 140, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
        this.player.animations.add('right', [1,2], 8, true);
        this.player.animations.add('left', [3,4], 8, true);

        this.createWorld();

        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);
        
        this.gem = game.add.sprite(340, 300, 'gem');
        this.gem.scale.setTo(2, 2);
        game.physics.arcade.enable(this.gem); 
        this.gem.anchor.setTo(0.5, 0.5);

        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        game.global.score = 0;
        
        //this.deathLabel = game.add.text(380, 290, 'Deaths: 0', { font: '18px Arial', fill: '#ffffff' });
        //this.death = 0;
        
        /*this.timeLabel = game.add.text(390, 30, 'Time: 120', { font: '18px Arial', fill: '#ffffff' });
        this.time = 120;
        game.time.events.loop(1000, this.countdown, this);*/

        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
        
        // Add and start the music in the 'create' function of the play.js file
        // Because we want to play the music when the play state starts
        game.global.music = game.add.audio('music'); // Add the music
        game.global.music.loop = true; // Make it loop
        game.global.music.play(); // Start the music
        
        this.emitter = game.add.emitter(0, 0, 15);
        this.emitter.makeParticles('pixel');
        this.emitter.setYSpeed(-150, 150);
        this.emitter.setXSpeed(-150, 150);
        this.emitter.setScale(2, 0, 2, 0, 800);
        this.emitter.gravity = 0;
        
        if (!game.device.dekstop) {
            // Call 'orientationChange' when the device is rotated
            game.scale.onOrientationChange.add(this.orientationChange, this);

            // Create an empty label to write the error message if needed
            this.rotateLabel = game.add.text(game.width/2, game.height/2, '',
            { font: '30px Arial', fill: '#fff', backgroundColor: '#000' });
            this.rotateLabel.anchor.setTo(0.5, 0.5);

            // Call the function at least once
            this.orientationChange();
        }
    },
    
    startMenu: function() {
        game.state.start('menu');
    },

    update: function() {
        game.physics.arcade.collide(this.player, this.layer);
        game.physics.arcade.collide(this.enemies, this.layer);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        game.physics.arcade.overlap(this.player, this.gem, this.takeGem, null, this);
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);

        this.movePlayer(); 
        if(!this.player.alive){
            return;
        }
        if (!this.player.inWorld) {
            //this.resetPlayer();
            //this.playerDie();
            game.state.start('level2');
        }
        
         if (this.nextEnemy < game.time.now) {
            var start = 4000, end = 1000, score = 100;
            var delay = Math.max(start - (start - end) * game.global.score / score, end);
            
            this.addEnemy();
            this.nextEnemy = game.time.now + delay;
        }
    },
    
    enemyJump: function(enemy) {
       var item = [1, 2, 3, 4];
        /*if(enemy.body.touching.down) {
            var rndItem = game.rnd.pick(item);
            if(rndItem == 1)
                enemy.body.velocity.y = -150;
            else
                return;
        }*/
        
        var distance = this.player.x - enemy.x;
        console.log(this.player.y);
        console.log(enemy.y);
        //var distance = game.physics.arcade.distanceBetween(this.player, enemy);
        if(distance <= 150 && this.player.y + 10 == enemy.y && enemy.body.onFloor) {
            console.log(distance);
            var rndItem = game.rnd.pick(item);
            if(rndItem == 1 || rndItem == 2 || rndItem == 3)
                enemy.body.velocity.y = -200;
            else
                return;
            enemy.body.velocity.y = -200;
        }
    },
    
    resetPlayer: function() {
        var playerPosition = [
            {x: game.width/4, y: game.height/2},
            {x: game.width * 3 / 4, y: game.height/2}, 
            {x: game.width/2, y: game.height/2},
            {x: 40, y: 270}, {x: 430, y: 270}
        ];
        
        var newPosition = game.rnd.pick(playerPosition);
        this.player.reset(newPosition.x, newPosition.y);
    },
    
    movePlayer: function() {
        if(game.input.totalActivePointers == 0) {
            this.moveLeft = false;
            this.moveRight = false;
        }
        if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
            this.player.body.velocity.x = -200;
            this.player.animations.play('left')
        }
        else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
            this.player.body.velocity.x = 200;
            this.player.animations.play('right')
        }
        else {
            this.player.body.velocity.x = 0;
            this.player.animations.stop();
            this.player.frame = 0;
        }

        if ((this.cursor.up.isDown || this.wasd.up.isDown) && this.player.body.onFloor()) {
            this.jumpPlayer();
        }      
    },

    countdown: function() {
        this.time -= 1;
        if(this.time <= 0){
            this.music.stop();
            game.state.start('menu');
        }
        this.timeLabel.text = 'Time: ' + this.time;
    },
    
    takeCoin: function(player, coin) {
        this.coinSound.play();
        this.coin.scale.setTo(0, 0);
        game.add.tween(this.coin.scale).to({x: 1, y: 1}, 300).start();
        game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
        game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;

        this.updateCoinPosition();
    },
    
    takeGem: function(player, gem) {
        this.coinSound.play();
        this.gem.scale.setTo(0,0);
        game.add.tween(this.gem.scale).to({x: 2, y: 2}, 300).start();
        game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
        game.global.score += 10;
        this.scoreLabel.text = 'score: ' + game.global.score;

        this.updateGemPosition();
    },

    updateCoinPosition: function() {
        var coinPosition = [ 
            {x: game.width/4, y: 220},
            {x: game.width * 3 / 4, y: 220},
            {x: 60, y: 140}, {x: 440, y: 140}, 
            {x: 40, y: 300}, {x: 460, y: 300} 
        ];

        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x == this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }

        var newPosition = game.rnd.pick(coinPosition);
        this.coin.reset(newPosition.x, newPosition.y);
    },
    
    updateGemPosition: function() {
        var gemPosition = [
            {x: 140, y: 60}, {x: 360, y: 60},
            {x: 150, y: 300},{x: 340, y: 300}
        ];

        for (var i = 0; i < gemPosition.length; i++) {
            if (gemPosition[i].x == this.coin.x) {
                gemPosition.splice(i, 1);
            }
        }

        var newPosition = game.rnd.pick(gemPosition);
        this.gem.reset(newPosition.x, newPosition.y);
    },

    addEnemy: function() {
        var enemy = this.enemies.getFirstDead();

        if (!enemy) {
            return;
        }

        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.width/2, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
        
       // game.time.events.loop(1000, this.enemyJump, this, enemy);
    },
    
    removeEnemy: function() {
        this.enemies.callAll('kill');
    },

    createWorld: function() {
            // Create the tilemap
        this.map = game.add.tilemap('map');

        // Add the tileset to the map
        this.map.addTilesetImage('tileset');

        // Create the layer by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Tile Layer 1');

        // Set the world size to match the size of the layer
        this.layer.resizeWorld();

        // Enable collisions for the first tilset element (the blue wall)
        this.map.setCollision(1);
    },

    playerDie: function(player, enemy) {
       // this.death += 1;
       // this.deathLabel.text = 'Death: ' + this.death;
       //this.player.reset(game.width/2,game.height/2);
       /* this.removeEnemy();
        console.log(player);
        console.log(enemy);
        enemy.animations.play('die');
        enemy.kill();
        enemy.destroy();*/
        
        console.log('dead');
        this.player.kill();
        this.emitter.x = this.player.x;
        this.emitter.y = this.player.y;
        this.emitter.start(true, 800, null, 15);
        this.deadSound.play();
        game.camera.flash(0xffffff, 300);
        game.camera.shake(0.02, 300);
        this.game.global.music.stop();
        game.time.events.add(1000, this.startMenu, this);
    },
    
    addMobileInputs: function() {
        var jumpButton = game.add.sprite(350, 240, 'jumpButton');
        jumpButton.inputEnabled = true;
        jumpButton.alpha = 0.5;
        jumpButton.events.onInputDown.add(this.jumpPlayer, this);
        
        this.moveLeft = false;
        this.moveRight = false;
        
        // Add the move left button
        var leftButton = game.add.sprite(50, 240, 'leftButton');
        leftButton.inputEnabled = true;
        leftButton.alpha = 0.5;
        leftButton.events.onInputOver.add(this.setLeftTrue, this);
        leftButton.events.onInputOut.add(this.setLeftFalse, this);
        leftButton.events.onInputDown.add(this.setLeftTrue, this);
        leftButton.events.onInputUp.add(this.setLeftFalse, this);

        // Add the move right button
        var rightButton = game.add.sprite(130, 240, 'rightButton');
        rightButton.inputEnabled = true;
        rightButton.alpha = 0.5;
        rightButton.events.onInputOver.add(this.setRightTrue, this);
        rightButton.events.onInputOut.add(this.setRightFalse, this);
        rightButton.events.onInputDown.add(this.setRightTrue, this);
        rightButton.events.onInputUp.add(this.setRightFalse, this);
    },
    
    jumpPlayer: function() {
        if(this.player.body.onFloor()) {
            this.player.body.velocity.y = -320;
            this.jumpSound.play();
        }
    },
    
    setLeftTrue: function() {
        this.moveLeft = true;
    },
    
    setLeftFalse: function() {
        this.moveLeft = false;
    },
    
    setRightTrue: function() {
        this.moveRight = true;
    },
    
    setRightFalse: function() {
        this.moveRight = false;
    },
    
    orientationChange: function() {
        if (game.scale.isPortrait) {
        // Pause the game and add a text explanation
            game.paused = true;
            this.rotateLabel.text = 'rotate your device in landscape';
        }
        // If the game is in landscape (good orientation)
        else {
            // Resume the game and remove the text
            game.paused = false;
            this.rotateLabel.text = '';
        }
    }
};