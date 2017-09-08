window.onload = init;

var max_battles = 25;

class Battle
{
	//handles getting battle id and the two teams
	constructor(data, onDeath)
	{
		//grab the battle id
		this.battleId = data[0].trim();
		//looking for pokemon
		this.team1 = [];
		this.team2 = [];
		for(var i = 0; i < data.length; i++)
		{
			if(data[i] == "poke")
			{
				//"...|poke|pX|PokemonName,..." is the string format
				//we see which team we're looking at and add the pokemon to it
				var mon = data[i + 2].split(",")[0];
				if(data[i + 1] == "p1")
				{
					this.team1.push(mon);
				}
				else
				{
					this.team2.push(mon);
				}
			}
		}

		//register the callback for when the battle is over
		this.onDeath = onDeath;

		//start timeout checking on time
		this.heartbeat();
		var t = this;
		this.timer = setInterval(function() {t.timeoutCheck();}, 60 * 1000);
	}

	timeoutCheck()
	{
		var currentTime = new Date().getTime();
		console.log("checking timer on ", this.battleId);
		if(currentTime - this.lastMessageTime > 6 * 60 * 1000)//6 minute timeout
		{
			console.log("time out on " + this.battleId);
			this.onDeath();
			clearInterval(this.timer);
		}
	}

	//checks the data to see if we need to save the data
	//save it by posting to the logging php script
	//Also update the timeout when we receive some data
	parseData(data)
	{
		if(data[1] != "j" && data[1] != "l")
		{
			this.heartbeat();
		}
		
		//match just ended
		//get ratings, results, and post info
		if(data[1] == "raw")
		{
			//we're looking at the messages that say how the rating changed
			//we just parse for rating and see if player 1 won, the update our info
			var message1 = data[2];
			var rating1 = getRating(message1);
			var message2 = data[4];
			var rating2 = getRating(message2);
			var winner;
			if(getWinning(message1))
			{
				winner = 1;
			}
			else
			{
				winner = 2;
			}
			//makes it easier to match the log and the console if this is printed
			console.log("winner on " + this.battleId, winner, rating1, rating2);
			//send all our data to a logging program
			var timestamp = Date.now();
			$.post("/logger.php", {"battleId" : this.battleId, "team1" : this.team1, "team2" : this.team2, "timestamp" : timestamp, "rating1" : rating1, "rating2" : rating2, "winner" : winner});
			this.onDeath();
			clearInterval(this.timer);
		}
		else if(data[1] == "expire")
		{
			this.onDeath();
			clearInterval(this.timer);
		}
		console.log("msg on " + this.battleId, data);
	}

	//updates the timeout
	heartbeat()
	{
		this.lastMessageTime = new Date().getTime();
	}
}

function getRoomUrl()
{
	var sock = new SockJS("http://sim.smogon.com:8000/showdown");
	sock.onmessage = function(e)
	{
		var data = e.data.split("|");
		console.log(data)
	}
	sock.onopen = function()

	{
		//as soon as we connect, get the room list
		roomQuery(sock);
	}

}


function init()
{
	//connects us to showdown
	var sock = new SockJS("http://sim.smogon.com:8000/showdown");

	//list of battles
	var battle_map = {};

	sock.onmessage = function(e)
	{
		console.log("num battles: ", Object.keys(battle_map).length);
		//data is put in groups with |
		var data = e.data.split("|");
	
		//we just go a list of rooms
		if(data[1] == "queryresponse" && data[3] != "null")
		{
			console.log(sock)
			if(Object.keys(battle_map).length >= max_battles)//don't even try to join too many battles
			{
				return;
			}
			//clear the teams if we've already recorded a game
			//match vgc 2017 games
			var regex = new RegExp("battle\\-gen7vgc2017\\-[0-9]{9}","g");
			var match;
			//data 3 is were the list of rooms is
			matches = [];
			do
			{
				match = regex.exec(data[3]);
				if(match)
				{
					matches.push(match[0]);
				}
			} while(match);

			console.log(matches);
			//no vgc games found, try again in 3 seconds
			if(matches.length == 0 || matches[0] == null)
			{
				console.log("no matches");
				setTimeout(function(){sock.send("|/query roomlist");}, 3000);
			}
			else
			{
				//try to join the first max_battle matches, if possible
				var curBattles = 0;
				if(Object.keys(battle_map).length)
				{
					curBattles = Object.keys(battle_map).length;
				}
				console.log("to add: ", matches.length, " vs ", max_battles - curBattles);
				for(var i = 0; i < (max_battles - curBattles) && i < matches.length; i++)
				{
					//setTimeout in loops is weird
					if(!((">" + matches[i].trim()) in battle_map))
					{
						(function(n){setTimeout(function(){sock.send("|/join " + matches[n]);}, 3000 * n + 1000);})(i);//each command is a few seconds apart
					}
				}
			}
		}
		else if(data[1] == "init")
		{
			//add a battle to our list
			var battleId = data[0].trim();
			battle_map[battleId] = new Battle(data, function()
					{
						delete battle_map[data[0].trim()];
						sock.send("|/leave " + data[0].trim().split(">")[1]);
						roomQuery(sock);
					});
			console.log("added battle ", battleId);
		}
		else if(data[0].trim() in battle_map)
		{
			console.log("sending data to ", data[0].trim());
			battle_map[data[0].trim()].parseData(data);
		}
		else
		{
			console.log("not sending to ", data[0].trim());
			console.log(battle_map);
		}

		//debugging and actually seeing things happen
		console.log("msg", data);
		console.log("-------------------------");
	};

	sock.onopen = function()
	{
		//as soon as we connect, get the room list
		roomQuery(sock);
	}
}

function roomQuery(sock)
{
	setTimeout(function(){sock.send("|/cmd roomlist gen7vgc2017")}, 10 * 1000);
}

function restart()
{
	location.reload();//easier to deal with connection issues
}

//gets the rating from the raw message
function getRating(msg)
{
	var splitMsg = msg.split(" ");//split on space
	console.log(splitMsg)
	return splitMsg[splitMsg.length - 6];
}

//sees if a player won based on the raw message
function getWinning(msg)
{
	return msg.indexOf("winning") > -1;
}
	

