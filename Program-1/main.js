var mainState = {

    preload: function () {
        game.load.image('player', 'assets/player_icon.PNG');
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        game.load.image('coin', 'assets/gold_coin.png');
        game.load.image('enemy', 'assets/snail_icon.png');
        game.load.image('gem', 'assets/gem.png');
    },

    create: function() { 
        game.stage.backgroundColor = '#3498db';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.renderer.renderSession.roundPixels = true;

        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;

        this.createWorld();

        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);
        
        this.gem = game.add.sprite(340, 300, 'gem');
        game.physics.arcade.enable(this.gem); 
        this.gem.anchor.setTo(0.5, 0.5);

        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        this.score = 0;
        
        this.deathLabel = game.add.text(380, 290, 'Deaths: 0', { font: '18px Arial', fill: '#ffffff' });
        this.death = 0;
        
        this.timeLabel = game.add.text(390, 30, 'Time: 120', { font: '18px Arial', fill: '#ffffff' });
        this.time = 120;
        game.time.events.loop(1000, this.countdown, this);

        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
    },

    update: function() {
        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        game.physics.arcade.overlap(this.player, this.gem, this.takeGem, null, this);
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);

        this.movePlayer(); 

        if (!this.player.inWorld) {
            this.resetPlayer();
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
        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = -200;
        }
        else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 200;
        }
        else {
            this.player.body.velocity.x = 0;
        }

        if (this.cursor.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -320;
        }      
    },

    countdown: function() {
        this.time -= 1;
        if(this.time <= 0){
            game.state.start('main');
            console.log('dun');
        }
        this.timeLabel.text = 'Time: ' + this.time;
    },
    
    takeCoin: function(player, coin) {
        this.score += 5;
        this.scoreLabel.text = 'score: ' + this.score;

        this.updateCoinPosition();
    },
    
    takeGem: function(player, gem) {
        this.score += 10;
        this.scoreLabel.text = 'score: ' + this.score;

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
    },
    
    removeEnemy: function() {
        this.enemies.callAll('kill');
    },

    createWorld: function() {
        this.walls = game.add.group();
        this.walls.enableBody = true;

        game.add.sprite(0, 0, 'wallV', 0, this.walls); 
        game.add.sprite(480, 0, 'wallV', 0, this.walls); 
        game.add.sprite(0, 0, 'wallH', 0, this.walls); 
        game.add.sprite(300, 0, 'wallH', 0, this.walls);
        game.add.sprite(0, 320, 'wallH', 0, this.walls); 
        game.add.sprite(300, 320, 'wallH', 0, this.walls); 
        game.add.sprite(-100, 160, 'wallH', 0, this.walls); 
        game.add.sprite(400, 160, 'wallH', 0, this.walls); 
        var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);

        this.walls.setAll('body.immovable', true);
    },

    playerDie: function(player, enemy) {
        this.death += 1;
        this.deathLabel.text = 'Death: ' + this.death;
        /*this.player.reset(game.width/2,game.height/2);
        this.removeEnemy();*/
        console.log(player);
        console.log(enemy);
        enemy.animations.play('die');
        enemy.kill();
        enemy.destroy();
    },
};

var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');