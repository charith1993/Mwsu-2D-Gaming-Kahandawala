var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  
// serve static files from the current directory
app.use(express.static(__dirname));

var Eureca = require('eureca.io');


//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setId', 'spawnEnemy', 'kill','updateState']});

var players = {};
 
//attach eureca.io to our http server
eurecaServer.attach(server);

//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
	
	//the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
	
	//register the client
	players[conn.id] = {id:conn.id, remote:remote, state:null}
	
	//here we call setId (defined in the client side)
	remote.setId(conn.id);	
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
	
	var removeId = players[conn.id].id;
	
	delete players[conn.id];
	
	for (var c in players)
	{
		var remote = players[c].remote;
		
		//here we call kill() method defined in the client side
		remote.kill(conn.id);
	}	
});

/**
* Player logs itself into the array of players (handshake still needs to be called
* to do the update. That's done on the client right after). 
*/
eurecaServer.exports.initPlayer = function (id,state) {
    console.log(state);
    
    players[id].state=state;
}

/**
* Player calls this method in it's update function and sends in it's state 
* whenever it wants. 
* This method turns around and sends out player states to everyone. 
*/
eurecaServer.exports.handleState = function (id,state) {
    console.log(id,state);
    
    players[id].state = state;
    	
	for (var c in players)
	{
		var remote = players[c].remote;
		
		remote.updateState(id, state);
		
	}
}

/**
* This method broadcasts all players state's to everyone. 
*/
eurecaServer.exports.handshake = function()
{
    console.log("handshake");
	for (var c in players)
	{
		var remote = players[c].remote;
		for (var cc in players)
		{		
			remote.spawnEnemy(players[cc].id,players[cc].state);		
		}
	}
}




app.get('/', function (req, res, next) {
    res.sendFile(__dirname+'/index.html');
});


server.listen(process.env.PORT || 55555, function () {
    console.log('\033[96mlistening on localhost:55555 \033[39m');
});
