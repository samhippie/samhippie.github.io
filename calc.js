var pokemon_keys;
var pokemon_select;
var attack_keys;
var attack_select;
var nature_select;
var EV_text;
var IV_text;
var stage_select;
var misc_text;

var interesting_pokemon =
	["groudonprimal",
	 "kyogreprimal",
	 "kangaskhanmega",
	 "xerneas",
	 "cresselia",
	 "rayquazamega",
	 "hooh",
	 "salamencemega"];

window.onload = init;
function init()
{
	//add custom pokemon from GET
	var custom_pokemon = window.location.search.replace("?", "").split("&").filter(function (name)
	{
		return name in BattlePokedex;
	});
	for(pokemon of custom_pokemon)
	{
		interesting_pokemon.push(pokemon);
	}

	//initialize the list of pokemon using pokedex.js
	init_pokemon_list();
	//initialize the list of moves using moves.js
	init_attack_list();
	//get the nature select
	nature_select = document.getElementById("nature");
	//get the EV text input
	EV_text = document.getElementById("EV");
	//get the IV text input
	IV_text = document.getElementById("IV");
	//get the select of offensive stage
	stage_select = document.getElementById("stage");
	//get the misc mult text input
	misc_text = document.getElementById("misc");
	
	//set callback for submit button
	document.getElementById("submit").onclick=submit_callback;
}

function do_attack(attack, attacker, attack_EV, attack_IV, attack_stage, attack_nature, misc,
				   target, target_hp_EV, target_def_EV, target_hp_IV, target_def_IV, target_nature)
{
	//get the correct base attack stat
	//also check the type of attack
	var base_atk_stat;
	var isPhysical;
	if(attack.category == "Physical")
	{
		base_atk_stat = attacker.baseStats.atk;
		isPhysical = true;
	}
	else
	{
		base_atk_stat = attacker.baseStats.spa;
		isPhysical = false;
	}

	//calculate the actual attack stat
	var atk_stat = stat_calc(base_atk_stat, attack_IV, attack_EV, 50, attack_nature) * attack_stage;

	//get base power of move
	var base_power = attack.basePower;

	var isSpread = false;
	//apply spread damage modifier
	if(attack.target == "allAdjacent" || attack.target == "allAdjacentFoes")
	{
		isSpread = true;
	}

	//calculate multiplier due to stab
	var stab = 1.0;
	if(attacker.types.indexOf(attack.type) != -1)
	{
		stab = 1.5;
	}
	
	var type_mul = 1.0;
	//maps showdown's type effectiveness to actual multiplier
	var type_muls=[1.0, 2.0, 0.5, 0.0];

	//multiply the effectiveness of each type
	for(type of target.types)
	{
		type_mul *= type_muls[BattleTypeChart[type].damageTaken[attack.type]]
	}

	//find the relevant defense stat
	var base_def_stat;
	if(isPhysical)
	{
		base_def_stat = target.baseStats.def;
	}
	else
	{
		base_def_stat = target.baseStats.spd;
	}

	//the actual stats of the target
	var def_stat = stat_calc(base_def_stat, target_def_IV, target_def_EV, 50, target_nature);
	var hp_stat = hp_stat_calc(target.baseStats.hp, target_hp_IV, target_hp_EV, 50);
	
	//get the raw damage done
	var range = damage(atk_stat, def_stat, base_power, stab, type_mul, misc, isSpread);

	//finding the percentage done based on HP
	var percent = [0,0];
	percent[0] = Math.oldround(1000 * range[0] / hp_stat) / 10;
	percent[1] = Math.oldround(1000 * range[1] / hp_stat) / 10;

	return [range, percent];
}

function submit_callback()
{
	var pokemon_index = pokemon_select.options.selectedIndex;
	var attack_index = attack_select.options.selectedIndex;
	var nature_index = nature_select.options.selectedIndex;
	var EV = parseInt(EV_text.value);
	var IV = parseInt(IV_text.value);
	var stage = -1 * (stage_select.options.selectedIndex - 6);
	var misc = parseFloat(misc_text.value);
	
	//if anything is on the meaningless default, do nothing
	if(pokemon_index == 0 ||
	   attack_index == 0 ||
	   nature_index == 0 ||
	   isNaN(EV))
	{
		console.log("sorry");
		return;
	}

	if(isNaN(misc))
	{
		misc = 1.0;
	}
	
	//get the attacking pokemon and move
	var attacking_pokemon = BattlePokedex[pokemon_keys[pokemon_index - 1]];
	var attacking_move = BattleMovedex[attack_keys[attack_index - 1]];


	//figure out the damage multiplier based on boosts
	var stage_mult;
	if(stage > 0)
	{
		stage_mult = (2.0 + stage) / 2.0;
	}
	else if(stage < 0)
	{
		stage_mult = 2.0 / (2.0 + stage);
	}
	else
	{
		stage_mult = 1.0;
	}

	//get the multiplier based on nature
	var nature;
	if(nature_index == 1)
	{
		nature = 1.1;
	}
	else if(nature_index == 2)
	{
		nature = 1.0;
	}
	else if(nature_index == 3)
	{
		nature = 0.9;
	}

	//iterate over each interesting pokemon e.g. kang
	var target_def_nature = [1, 1, 1.1];
	var target_hp_EV = [4, 252, 252];
	var target_def_EV = [0, 0, 252]
	var target_title = ["Squishy (4/0)", "Kinda bulky (252/0)", "BALKY (252/252+)"];

	//clear the previous calcs
	var right_div = document.getElementById("right");
	while(right_div.firstChild)
	{
		right_div.removeChild(right_div.firstChild);
	}
	//var type_muls = [1.0, 2.0, 0.5, 0.0];
	for(target_index of interesting_pokemon)
	{
		for(var i = 0; i < 3; i++)
		{
			//the actual pokemon
			var target = BattlePokedex[target_index];
			
			//get the damage in form [[low percent, hight percent],[low damage, high damage]]
			damages = do_attack(attacking_move, attacking_pokemon, EV, IV, stage_mult, nature, misc, target, target_hp_EV[i], target_def_EV[i], 31, 31, target_def_nature[i]);
			
			//what goes in the <p>
			var outstring = target.species + " (" + target_title[i] + "): " + 
							damages[1][0] + "%-" + damages[1][1] + "%" +
							" (" + damages[0][0] + "-" + damages[0][1] + ")";
			//insert outstring into the document
			var node = document.createElement("p");
			//color code to point out OHKOs and 2HKOs
			if(damages[1][0] >= 100)
			{
				node.style.color="green";
			}
			else if(damages[1][0] >= 50)
			{
				node.style.color="blue";
			}
			else
			{
				node.style.color="black";
			}
			var textNode = document.createTextNode(outstring);
			node.appendChild(textNode);
			document.getElementById("right").appendChild(node);
		}
	}
}

function int_div(x, y)
{
	return ~~(x / y);
}

Math.oldround = Math.round;
Math.round = function(n)
{
	return (n % 1 > 0.5) ? Math.ceil(n) : Math.floor(n);
}

//roll, then stab, then type, then misc
function damage(attack, defense, base, stab, type, misc, isSpread)
{
	//normal
	var damage = int_div(int_div((int_div(2 * 50, 5) + 2) * base * attack, defense), 50) + 2;
	if(isSpread)
	{
		damage = Math.round(damage * 0.75);
	}
	//roll
	var damage_min = int_div(damage * 85, 100);
	//stab
	damage = Math.round(damage * stab);
	damage_min = Math.round(damage_min * stab);
	//type
	damage = Math.round(damage * type);
	damage_min = Math.round(damage_min * type);
	//misc
	damage = Math.round(damage * misc);
	damage_min = Math.round(damage_min * misc);
	return [damage_min, damage];
}

function stat_calc(base, IV, EV, level, nature)
{
	return Math.floor((Math.floor((2.0 * base + IV + Math.floor(EV / 4.0)) * level / 100.0) + 5.0) * nature);
}

function hp_stat_calc(base, IV, EV, level)
{
	return Math.floor((2 * base + IV + Math.floor(EV / 4)) * level / 100) + level + 10
}

function init_pokemon_list()
{
	//grabbing the div and making a select form
	var div = document.querySelector("#attack_pokemon");
	var frag = document.createDocumentFragment();
	pokemon_select = document.createElement("select");
	//default option
	pokemon_select.options.add(new Option("Select your pokemon", "default", true, true));
	//keys goes from index to pokemon, sorted alphabetically
	pokemon_keys = Object.keys(BattlePokedex);
	var len = pokemon_keys.length,
		i = 0,
		prop,
		pokemon;
	pokemon_keys.sort();
	//populate the list with pokemon
	while(i < len)
	{
		prop = pokemon_keys[i];
		pokemon = BattlePokedex[prop];
		i += 1;
		pokemon_select.options.add(new Option(pokemon.species, i));
	}
	//attach new select
	frag.appendChild(pokemon_select);
	div.appendChild(frag);
}

function init_attack_list()
{
	//grabbing our div and making a select form
	var div = document.querySelector("#attack");
	var frag = document.createDocumentFragment();
	attack_select = document.createElement("select");
	//default option
	attack_select.options.add(new Option("Select your attack", "default", true, true));
	//keys maps numeric index to BattleMovedex (alphabetically)
	attack_keys = Object.keys(BattleMovedex);
	var len = attack_keys.length,
		i = 0,
		prop,
		move;
	attack_keys.sort();
	//populate our select with moves
	while(i < len)
	{
		prop = attack_keys[i];
		move = BattleMovedex[prop];
		i += 1;
		attack_select.options.add(new Option(move.name, i));
	}
	//attach select and return the key mapping
	frag.appendChild(attack_select);
	div.appendChild(frag);
}
