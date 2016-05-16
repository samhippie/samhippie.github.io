window.onload = init

var weights = [];
var biases = [];
var monToIndex = null;

function submit()
{
	var t1 = [];
	var t2 = [];
	for(var i = 0; i < 6; i++)
	{
		var selector1 = document.getElementById("mon" + i);
		var selector2 = document.getElementById("mon" + (6 + i));
		t1.push(selector1.value);
		t2.push(selector2.value);
	}
	t1 = t1.sort();
	t2 = t2.sort();
	var l = [t1,t2];
	l = l.sort();
	var switched = l[0] == t2;
	if(switched)
	{
		console.log("swapped");
	}
	t1 = l[0].map(function(x) monToIndex[x]);
	t2 = l[1].map(function(x) monToIndex[x]+128);
	 
	console.log(t1.concat(t2));

	input = sparse_vector(256, t1.concat(t2), Array(12).fill(1.0));
	console.log(weights);
	output = eval_network(input, weights, biases);
	var t1score;
	var t2score;
	if(switched)
	{
		t1score = output[1];
		t2score = output[0];
	}
	else
	{
		t1score = output[0];
		t2score = output[1];
	}
	document.getElementById("t1score").textContent = "Arbitrary score: " + math.round(t1score * 100.0)
	document.getElementById("t2score").textContent = "Arbitrary score: " + math.round(t2score * 100.0)
}

function loadJSON(name, callback)
{
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open("GET", name, true);
	xobj.onreadystatechange = function()
	{
		if(xobj.readyState == 4 && xobj.status == "200")
		{
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}


function sparse_vector(size, indices, values)
{
	var vector = Array(size).fill(0.0);
	for(var i = 0; i < indices.length; i++)
	{
		vector[indices[i]] = values[i];
	}
	return vector;
}

function handleData(data)
{
	var wb = JSON.parse(data).weights;
	for(var i = 0; i < wb.length / 2; i++)
	{
		weights.push(wb[2 * i]);
		biases.push(wb[2 * i + 1]);
	}
	console.log("weights loaded");
}

function softmax(vector)
{
	vector = vector.map(function(x) {return math.exp(x);})
	s = math.sum(vector);
	return vector.map(function(x) {return x / s;})
}

function eval_network(inputs, weights, biases)
{
	var r;
	for(var i = 0; i < weights.length; i++)
	{
		r = i < weights.length - 1;//don't rectify the last layer
		inputs = eval_layer(inputs, weights[i], biases[i], r)
	}
	return softmax(inputs);
}

function rect(x)
{
	return math.max(0,x)
}
		
function eval_layer(inputs, layer, biases, r)
{
	//inputs is an m sized vector
	//layers is a m x n sized matrix
	//need to matrix multiply layer * inputs
	//then need to apply a rectifier to each output
	//rectifier(x) = max(0,x)
	console.log(inputs);
	console.log(layer);
	var out = math.add(math.multiply(math.transpose(layer),inputs), biases);
	if(r)
	{
		out = out.map(rect);
	}
	return out
}

function loadIndexer(data)
{
	console.log("indexer loaded");
	monToIndex = JSON.parse(data).indexer;
	mons = Object.keys(monToIndex).sort();
	for(var i = 0; i < 12; i++)
	{
		select = document.getElementById("mon" + i);
		for(var j = 0; j < 128; j++)
		{
			var option = document.createElement("option");
			option.textContent = mons[j];
			option.value = mons[j];
			select.appendChild(option);
		}
	}
}

function init()
{
	console.log("loading")
	loadJSON("net.json", handleData);
	loadJSON("indexer.json", loadIndexer);
}
