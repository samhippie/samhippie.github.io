var sock = new SockJS("https://sim.smogon.com:8000/showdown");

sock.onopen = function()
{
	console.log("connected")
}

var state = 0;
var doAutoSearch = false;
var curRoom = "";
sock.onmessage = function(e)
{
	var data = e.data.split("|");
	console.log(data);
	if(state == 1)
	{
		console.log("just got the rooms");
		rooms = JSON.parse(data[3]).rooms;
		var best = null;
		Object.keys(rooms).map(function(i)
				{
					if(best == null || rooms[best].minElo < rooms[i].minElo)
						best = i
				});
		connect(best);
		state = 2;
	}
	else if(state == 2 && data[2].indexOf("Ladder updating...") != -1)
	{
		console.log("end of battle, todo do something here");
		sock.send("|/leave " + room);
		if(doAutoSearch)
			setTimeout(function(){search();}, 10000);
	}
}

function connect(room)
{
	var frame = document.getElementById("psframe");
	frame.src = "https://play.pokemonshowdown.com/" + room;
	sock.send("|/join " + room);
	curRoom = room;
}

function search()
{
	//var gametype = "gen7vgc2017";
	var gametype = document.getElementById("gametype").value;
	sock.send("|/cmd roomlist " + gametype);
	state = 1;
}

function autosearch(enable)
{
	document.getElementById("autosearch").disabled = enable;
	document.getElementById("stopautosearch").disabled = !enable;
	doAutoSearch = enable;
	if(enable)
		search();
}
