window.onload = function()
{
	//hiding some sections that we'll show later
	document.getElementById("findroom").hidden = true;
	document.getElementById("roomwait").hidden = true;
	document.getElementById("gamesetup").hidden = true;
}

function connect()
{
	var server = document.getElementById("server").value;
	var port = document.getElementById("port").value;
	init(server, port);
}

var sock;
var inSetup = false;
var oldPieces;
function init(server, port)
{
	//connects us to the game server
	sock = new SockJS("http://" + server + ":" + port + "/kindachess");

	//reseting some game stuff
	for(var i = 0; i < spawnedPieces.length; i++)
		spawnedPieces[i] = 0;
	curPieces = null;

	sock.onopen = function()
	{
		console.log("open");
		document.getElementById("findroom").hidden = false;
		document.getElementById("findserver").hidden = true;
	}

	sock.onmessage = function(msg)
	{
		console.log(msg.data.split("|"));
		var data = msg.data.split("|");
		//the room is ready for us to begin
		if(data[0] == "roomready")
		{
			postMessage(data[1] + ", " + data[2] + " room is ready");
			document.getElementById("roomwait").hidden = true;
			document.getElementById("gamesetup").hidden = false;
			inSetup = true;
			isUserWhite = data[3] == "white";
			canvasMain(true);
		}
		else if(data[0] == "roomfail")
		{

			postMessage("Room " + data[1] + "failed. Please try again.");
			document.getElementById("findroom").hidden = false;
			document.getElementById("gamesetup").hidden = true;
		}
		else if(data[0] == "gameready")
		{
			//data[1] has the game pieces
			canvasMain(false);
			inSetup = false;
			var pieces = data[1].split(",");
			setPieces(pieces);
			oldPieces = pieces.slice();
			document.getElementById("submitbutton").disabled = false;
		}
		else if(data[0] == "gameerror")
		{
			postMessage("Invalid setup");
			document.getElementById("submitbutton").disabled = false;
		}
		else if(data[0] == "turnerror")
		{
			postMessage("invalid move");
			document.getElementById("submitbutton").disabled = false;
		}
		else if(data[0] == "msg")
		{
			for(var i = 1; i < data.length; i++)
			{
				postMessage(data[i]);
			}
		}
	}

	sock.onclose = function()
	{
		console.log("close");
		postMessage("connection to server failed");
		document.getElementById("findroom").hidden = true;
		document.getElementById("gamesetup").hidden = true;
		document.getElementById("roomwait").hidden = true;
		document.getElementById("submitbutton").disabled = false;
		document.getElementById("findserver").hidden = false;
	}
}

var lastChild;
function postMessage(msg)
{
	var rightdiv = document.getElementById("rightdiv");
	if(lastChild = null)
		lastChild = document.getElementById("messdiv");
	var text = document.createTextNode(msg);
	rightdiv.insertBefore(text, lastChild);
	rightdiv.insertBefore(document.createElement("br"),text);
}

function gameQuit()
{
	sock.send("quit|");
}

function gameSubmit()
{
	if(inSetup)
	{
		console.log("set submit");
		sock.send("set|" + spawnedPieces);
		console.log("set|" + spawnedPieces);
	}
	else
	{
		sock.send("move|" + curPieces);
		console.log("move submit");
	}
	document.getElementById("submitbutton").disabled = true;
}

function gameReset()
{
	if(inSetup)
	{
		canvasMain(true);
		for(var i = 0; i < spawnedPieces.length; i++)
		{
			spawnedPieces[i] = 0;
		}
	}
	else
	{
		canvasMain(false);
		setPieces(oldPieces);
	}
}

function roomSubmit()
{
	var name = document.getElementById("name").value;
	var room = document.getElementById("room").value;
	var white = document.getElementById("white").checked;

	sock.send(name + "|" + room + "|" + (white ? "white" : "black"));
	document.getElementById("findroom").hidden = true;
	document.getElementById("roomwait").hidden = false;
}

//these two are just easy test buttons
function handler1()
{
	sock.send("p1|banana|white");
	document.getElementById("findroom").hidden = true;
	document.getElementById("roomwait").hidden = false;
}
function handler2()
{
	sock.send("p2|banana|black");
	document.getElementById("findroom").hidden = true;
	document.getElementById("roomwait").hidden = false;
}
