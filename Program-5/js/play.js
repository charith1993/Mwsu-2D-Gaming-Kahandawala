// is the map done generating?
var isReady = false;

// map dimensions
var ROWS = 30;
var COLS = 40;

var player;
var enemies;
var enemySpeed;
var actors;

// the structure of the map
var mapData;
var map;
var layer;
var layer2;

var easystar;   //pathfinder

//map steps for generation
var numberOfSteps = 4; //How many times will we pass over the map
var deathLimit = 3; //Least number of neighbours required to live
var birthLimit = 3; //Greateast number of neighbours before cell dies
var chanceToStartAlive = 0.30;  //chance of being generated as alive

// initialize phaser, call create() once done
var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {
    game.load.image('ground_1x1', 'assets/ground_1x1.png');
    game.load.image('four_tiles', 'assets/four-tiles.png');"
    game.load.image('stone_ground', 'assets/stone_floor.png');"
    mapData = generateMap();    //random map generation
    easystar = new EasyStar.js();   //start the pathfinder
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Maps and layers
    map = game.add.tilemap();
    walls = game.add.group();
    tiles = map.addTilesetImage('tileset', null, 20, 20);
    layer = map.create('level1', COLS, ROWS, 20, 20);
    layer2 = map.createBlankLayer('collisions', COLS, ROWS, 20, 20);
    layer2.properties = {'collision' : true};
    layer.resizeWorld();

    //player
   /* actors = game.add.group();
    player = actors.create(0, 0, 'player', null, false);
    player.anchor.setTo(0.5)
    //player physics
    game.physics.arcade.enable(player);
    player.enableBody = true;
    player.body.collideWorldBounds = true;
    player.body.immovable = true;
    player.body.setSize(
        player.body.width * 0.6,
        player.body.height * 0.5,
        player.body.width * 0.2,
        player.body.height * 0.5
    );

    //enemy group
    enemies = game.add.group();
    enemies.createMultiple(3, 'clown');
    actors.add(enemies);
    //enemy physics
    enemySpeed = 50;
    enemies.forEach(function(actor){
        actor.anchor.setTo(0.5)
        game.physics.arcade.enable(actor);
        actor.enableBody = true;
        actor.body.collideWorldBounds = true;
        actor.body.immovable = true;
        actor.body.setSize(
            actor.body.width * 0.8,
            actor.body.height * 0.5,
            actor.body.width * 0.2,
            actor.body.height * 0.5
        );
        actor.data = {
            nextStep: null,
            enemyPath: []
        };
    });
*/
    //Draw the map first, then generate player/enemies
    drawMap(function(){generateActors();});

    //EasyStar stuff; makes calculations using the raw
    //  2D boolean array to determine paths. This is then
    //  used to interact with tilemap
    easystar.setGrid(mapData);
    easystar.setAcceptableTiles([false]);
    easystar.enableDiagonals();
}

function generateMap() {
    //Create a new map
    var cellmap = [];

    for (var y=0; y<ROWS; y++) {
        var newRow = [];
        cellmap.push(newRow);

        for (var x=0;x<COLS;x++)
            newRow.push(false);
    }

    //Set up the map with random values
    cellmap = initialiseMap(cellmap);

    //And now run the simulation for a set number of steps
    for(var i = 0; i < numberOfSteps; i++) {
        cellmap = doSimulationStep(cellmap);
    }

    return cellmap;
}

function initialiseMap(mymap) {
    //generate initial values of the map
    for(var x=0; x < (ROWS); x++) {

        for(var y=0; y< (COLS); y++) {

            if(Math.random() < chanceToStartAlive)
                mymap[x][y] = true;
        }
    }
    return mymap;
}

function doSimulationStep(oldMap) {
    //Run through the map multiple times and adjust tiles to suit automata
    var newMap = [];

    for (var y = 0; y < ROWS; y++) {
        var newRow = [];
        newMap.push(newRow);

        for (var x = 0; x < COLS; x++)
            newRow.push( false );
    }

    //Loop over each row and column of the map
    for(var x = 0; x < oldMap.length; x++) {

        for(var y = 0; y < oldMap[0].length; y++) {
            var nbs = countAliveNeighbours(oldMap, x, y);

            //The new value is based on our simulation rules
            //First, if a cell is alive but has too few neighbours, kill it.
            if(oldMap[x][y]) {
                if(nbs < deathLimit) {
                    newMap[x][y] = false;
                } else {
                    newMap[x][y] = true;
                }
            } //Otherwise, if the cell is dead now, check if it has the right number of neighbours to be 'born'
            else{
                if(nbs > birthLimit) {
                    newMap[x][y] = true;
                } else {
                    newMap[x][y] = false;
                }
            }
        }
    }
    return newMap;
}

function countAliveNeighbours(map, x, y) {
    //Retrieve the number of living neighbours in relation to a cell
    var count = 0;

    for (var i = -1; i < 2; i++) {

        for(var j = -1; j < 2; j++) {
            var neighbour_x = x+i;
            var neighbour_y = y+j;

            //If we're looking at the middle point
            if(i === 0 && j === 0) {
                //Do nothing, we don't want to add ourselves in!
            }
            //In case the index we're looking at it off the edge of the map
            else if(neighbour_x < 0 || neighbour_y < 0 || neighbour_x >= map.length || neighbour_y >= map[0].length) {
                count = count + 1;
            } else if(map[neighbour_x][neighbour_y]) { //Otherwise, a normal check of the neighbour
                count = count + 1;
            }
        }
    }
    return count;
}

function drawMap(callback) {   //and player
    //Based on final map configuration, draw the tiles
    for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++) {
            var thisTile;
            if (mapData[y][x]){
                map.putTile(3, x, y, 'level1')
                map.putTile(0, x, y, 'collisions');
            }
            else{
                map.putTile(3, x, y, 'level1');
            }
        }
    map.setCollision(0); //tile 0 = wall

    callback();
}

/*function generateActors() {

    findSpawn(player);
    enemies.forEachDead(function(enemy){
        findSpawn(enemy);
    });
}*/

/*function findSpawn(actor) {
    //find a valid location on the map to spawn the plater
    var found = false;
    var tooClose;
    var spawnTile;
    for (var i = 0; i < ROWS*COLS; i++) {   //still looking...
        if (found === false){
            //grab random coordintes
            var x = game.rnd.integerInRange(0, COLS - 1) | 0;
            var y = game.rnd.integerInRange(0, ROWS - 1) | 0;
            var thatTile;
            var nbs;

            tooClose = false;   //Assume we're not too close
            thatTile = map.getTile(x, y, 'collisions'); //get tile we're looking at

            if (thatTile === null) {  //is tile walkable?
                thatTile = map.getTile(x, y, 'level1'); //change layers

                //If not placing the player, check if the enemy would be place too close
                if (actor !== player && game.physics.arcade.distanceBetween(player, thatTile) < 200){
                    tooClose = true;
                }

                //make sure we're not too close to another thing
                enemies.forEachAlive(function(actor){
                    if (game.physics.arcade.distanceBetween(actor, thatTile) < 30)
                        tooClose = true;
                });

                //make sure that it is surrounded by other walkable tiles
                nbs = countAliveNeighbours(mapData, thatTile.x, thatTile.y);

                //If all qualifications met, stop looking and mark location
                if (nbs === 0 && tooClose === false) {
                    found = true;
                    spawnTile = {x: thatTile.worldX, y: thatTile.worldY}
                }
            }
        }
    }

    if (found === true)
        actor.reset(spawnTile.x, spawnTile.y)
        else
            console.log("no valid location found");
}*/

function getWallIntersection(ray) {
    //Form array of all tiles that are intersected by the ray
    var blockingWalls = layer2.getRayCastTiles(ray)

    var hidden = false; //assume sighted until proven otherwise

    if (ray.length > 150)   //too far away
        return true;
    else{
        blockingWalls.forEach(function(thisTile){
            if (thisTile.index == 0){
                //wall in the way
                hidden = true;
            }
        });

        //Did enemy see player?
        return hidden;
    }
}

/*function updateEnemies(enemy) {
    //Get new path for the enemy

    var enemyTile = map.getTileWorldXY(enemy.x, enemy.y, 20, 20, 'level1');
    var playerTile = map.getTileWorldXY(player.x, player.y, 20, 20, 'level1');
    if(enemyTile && playerTile){

        easystar.findPath(enemyTile.x, enemyTile.y, playerTile.x, playerTile.y, function(path){
            enemy.enemyPath = path;
            if (path.length){

                if(enemyTile.x > path[0].x && enemyTile.y == path[0].y)
                    enemy.nextStep = 'L';
                else if (enemyTile.x < path[0].x && enemyTile.y == path[0].y)
                    enemy.nextStep = 'R';
                else if (enemyTile.x < path[0].x && enemyTile.y > path[0].y)
                    enemy.nextStep = 'RD';   //Gonna move right&down next
                else if (enemyTile.x > path[0].x && enemyTile.y > path[0].y)
                    enemy.nextStep = 'LD';   //Gonna move left&down next
                else if (enemyTile.x < path[0].x && enemyTile.y < path[0].y)
                    enemy.nextStep = 'RU';   //Gonna move right&up next
                else if (enemyTile.x > path[0].x && enemyTile.y < path[0].y)
                    enemy.nextStep = 'LU';   //Gonna move left&up next
                else if (enemyTile.x == path[0].x && enemyTile.y > path[0].y)
                    enemy.nextStep = 'D';
                else if (enemyTile.x == path[0].x && enemyTile.y < path[0].y)
                    enemy.nextStep = 'U';
            }
            else
                enemy.nextStep = null;
        });
        easystar.calculate();
    }
}

function update() {
    game.physics.arcade.collide(player, layer2);
    game.physics.arcade.collide(enemies, layer2);
    game.physics.arcade.collide(enemies, player);
    game.physics.arcade.collide(enemies);

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        player.body.velocity.x -= 100;
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        player.body.velocity.x += 100;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        player.body.velocity.y -= 100;
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        player.body.velocity.y += 100;
    }
}
  */
function render() {
    //game.debug.body(layer2);
}
