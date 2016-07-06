var game = new Phaser.Game(800, 800, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
   // game.load.image('ground_1x1', 'assets/ground_1x1.png');
    game.load.image('four_tiles', 'assets/four-tiles.png');
    //game.load.image('stone_ground', 'assets/stone_floor.png');
}

var map;
var layer1;
var layer2;
var layer3;

var marker;
var currentTile = 0;
var currentLayer;

var cursors;
var showLayersKey;
var layer1Key;
var layer2Key;
var layer3Key;

//modify these values to adjust the size and mount of rooms
var maxRooms = 10;
var minRoom_w = 4;
var minRoom_h = 4;
var maxRoom_w = 9;
var maxRoom_h = 9;

var mapSize = 30;
//An array of all of the rooms created
var createdRooms = [];

function create() {

    game.stage.backgroundColor = '#2d2d2d';
    //  Creates a blank tilemap
    map = game.add.tilemap();
    //  Add a Tileset image to the map
   map.addTilesetImage('four_tiles',null, 16, 16);
    
    //creates a 2d array
    var newMap = new Array(mapSize);
    for(var i = 0; i < mapSize; i++){
        newMap[i] = new Array(mapSize);
    }
    for(var i = 0; i<mapSize;i++) {
        for(var j = 0;j<mapSize;j++) {
            newMap[i][j] = 0;
        }
    }
    
    //  Creates a new blank layer and sets the map dimensions.
    //  In this case the map is 40x30 tiles in size and the tiles are 16x16 pixels in size.
    layer1 = map.create('level1', 40, 30, 16, 16);
    layer1.scrollFactorX = 0.5;
    layer1.scrollFactorY = 0.5;

    //  Resize the world
    layer1.resizeWorld();

    layer2 = map.createBlankLayer('level2', 40, 30, 16, 16);
    //layer2.scrollFactorX = 0.8;
    //layer2.scrollFactorY = 0.8;

    layer3 = map.createBlankLayer('level3', 40, 30, 16, 16);

    currentLayer = layer3;

    //  Create our tile selector at the top of the screen
    createTileSelector();

    game.input.addMoveCallback(updateMarker, this);

    cursors = game.input.keyboard.createCursorKeys();

    showLayersKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    layer1Key = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    layer2Key = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
    layer3Key = game.input.keyboard.addKey(Phaser.Keyboard.THREE);

    makeMap(newMap);
    renderMap(newMap);
}

function pickTile(sprite, pointer) {

    currentTile = game.math.snapToFloor(pointer.x, 16) / 16;

}

function updateMarker() {

    marker.x = currentLayer.getTileX(game.input.activePointer.worldX) * 16;
    marker.y = currentLayer.getTileY(game.input.activePointer.worldY) * 16;

    if (game.input.mousePointer.isDown)
    {
        map.putTile(currentTile, currentLayer.getTileX(marker.x), currentLayer.getTileY(marker.y), currentLayer);
        // map.fill(currentTile, currentLayer.getTileX(marker.x), currentLayer.getTileY(marker.y), 4, 4, currentLayer);
    }

}

function update() {

    if (cursors.left.isDown)
    {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 4;
    }

    if (cursors.up.isDown)
    {
        game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 4;
    }

}

function render() {

    //game.debug.text('Current Layer: ' + currentLayer.name, 16, 550);
    //game.debug.text('1-3 Switch Layers. SPACE = Show All. Cursors = Move Camera', 16, 570);

}

function createTileSelector() {

    //  Our tile selection window
    var tileSelector = game.add.group();

    var tileSelectorBackground = game.make.graphics();
    tileSelectorBackground.beginFill(0x000000, 0.5);
    tileSelectorBackground.drawRect(0, 0, 800, 34);
    tileSelectorBackground.endFill();

    //tileSelector.add(tileSelectorBackground);

    //var tileStrip = tileSelector.create(1, 1, 'ground_1x1');
    //tileStrip.inputEnabled = true;
    //tileStrip.events.onInputDown.add(pickTile, this);

    tileSelector.fixedToCamera = true;

    //  Our painting marker
    marker = game.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.drawRect(0, 0, 16, 16);

}

function Room (x, y, w, h, index) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.x1 = (this.x + this.w - 1);
    this.y1 = (this.y + this.h - 1);
    
    this.index = index;
    this.connectedTo = [];
}

//actually places the room in the correct position with correct dimensions
function createRoom(map) {
    for(var i = 0; i < maxRooms; i++) {
        var room = createdRooms[i];
        for(var x = room.x; x < room.x + room.w; x++) {
            for(var y = room.y; y < room.y + room.h ; y++) {
                map[x][y] = 1;
            }
        }
    }
}

//makes a blueprint of where all the rooms and corridors are supposed to be
function makeMap(map) {
    for(var i = 0; i < maxRooms; i++) {
        //generate random width, height, x and y coordinates for each room
        w = this.game.rnd.integerInRange(minRoom_w, maxRoom_w);
        h = this.game.rnd.integerInRange(minRoom_h, maxRoom_h);
        x = this.game.rnd.integerInRange(1, mapSize - w - 1);
        y = this.game.rnd.integerInRange(1, mapSize - h - 1);
        
        this.newRoom = new this.Room(x, y, w, h, i);
        //checks if rooms overlap. this is for a more 'pretty' looking dungeon
        if(doesOverlap(newRoom, map)) {
            i--;
            continue;
        }
        createdRooms.push(this.newRoom);
    }
    
    connectRooms(map);
    createRoom(map);
    
    //creates walls around the rooms and cooridors
    for (var x = 0; x < mapSize; x++) {
        for (var y = 0; y < mapSize; y++) {
            if (map[x][y] == 1) {
                for (var i = x - 1; i <= x + 1; i++) {
                    for (var j = y - 1; j <= y + 1; j++) {
                        if (map[i][j] == 0) 
                            map[i][j] = 2;
                    }
                }
            }
        }
    }
}

//renders the map based on the map blueprint generated
function renderMap(mapA) {
    //places tiles
    for(var i = 0;i < mapSize;i++) {
        for (var j = 0;j< mapSize;j++) {
            if(mapA[i][j] == 1 ) {
                map.putTile(currentTile, i, j, currentLayer);
            }
        }
    }
    //places white walls 
    for(var i = 0;i < mapSize;i++) {
        for (var j = 0;j< mapSize;j++) {
            if(mapA[i][j] == 2 ) {
                
                map.putTile('', i, j, currentLayer);
            }
        }
    }
}

function doesOverlap(room, map, ignore) {    
    for (var i = 0; i < createdRooms.length; i++) {
        if (i == ignore) continue;
        var check = this.createdRooms[i];
        if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h))) 
            return true;
    }

    return false;
}

function connectRooms(map) {
    for (var i = 0; i < maxRooms; i++) {     
        var roomA = createdRooms[i];     
        var roomB = findClosestRoom(roomA);  

        pointA = {         
            x: this.game.rnd.integerInRange(roomA.x + 1, roomA.x + roomA.w - 2),         
            y: this.game.rnd.integerInRange(roomA.y, roomA.y + roomA.h - 1) 
            
        };     
        pointB = {         
            x: this.game.rnd.integerInRange(roomB.x + 1, roomB.x + roomB.w - 2),         
            y: this.game.rnd.integerInRange(roomB.y + 1, roomB.y + roomB.h - 2)     
        };   

        while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
            if (pointB.x != pointA.x) {             
                if (pointB.x > pointA.x) {
                    pointB.x--;
                }
                else 
                    pointB.x++;
            } 
            else if (pointB.y != pointA.y) {
                if (pointB.y > pointA.y) {
                    pointB.y--;
                }
                else
                    pointB.y++;
            }
            map[pointB.x][pointB.y] = 1;
        }
        createdRooms[i].connectedTo.push(roomB.index);
        createdRooms[createdRooms.indexOf(roomB)].connectedTo.push(roomA.index);  
    }
    console.log(createdRooms);
}

function findClosestRoom(room) {
    var mid = {
        x: room.x + (room.w / 2),
        y: room.y + (room.h / 2)
    };
    var closest = null;
    var closest_distance = 1000;
    
    for (var i = 0; i < createdRooms.length; i++) {
        var reset = 0;
        var check = createdRooms[i];
        
        if (check == room) 
            continue;
        if(room.connectedTo.indexOf(check.index) != -1)
            continue;

        var check_mid = {
            x: check.x + (check.w / 2),
            y: check.y + (check.h / 2)
        };
        var distance = Math.abs(mid.x - check_mid.x) + Math.abs(mid.y - check_mid.y);
        if (distance < closest_distance) {
            closest_distance = distance;
            closest = check;
        }
    }
    return closest;
}