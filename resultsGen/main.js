var iconUrl = "https://github.com/msikma/pokesprite/raw/master/icons/pokemon/regular/"
var dwUrl = "https://samhippie.github.io/mon-pics/"
var bootstrapHeader="<html><head><link href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" rel=\"stylesheet\"><script src=\"https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js\"></script><script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\"></script>"

function genCss(co)//bg, bgImage, header, textColor, headerTextColor, font)
{
	s = "<style>\n";
	s += "body {background-color: " + co.bg + ";\ncolor: " + co.textColor + ";\n";
	s += "font-size: x-large;\n";
	if(co.bgImage != "")
		s += "background-image: url(\"" + co.bgImage + "\");\n";
	if(co.font != "")
		s += "font-family: " + font + ";}\n";
	else
		s += "}\n";
	s += ".jumbotron {\n";
	if(co.header != "")
		s += "background-image: url(\"" + co.header + "\");\nwidth: 100%;\n";
	s += "color: " + co.headerTextColor + ";\n";
	if(co.headerColor != "")
		s += "background-color: " + co.headerColor + ";\n";
	if(co.headerImage)
	{
		s += "margin-left: -15px;\n";
		s += "margin-right: -15px;\n";
	}
	s += "}\n";
	s += ".monentry {\n";
	if(co.monColor != "")
		s += "background-color: " + co.monColor + ";\n";
	s += "display: -webkit-box;\n";
	s += "display: -webkit-flex;\n";
	s += "display: -ms-flexbox;\n";
	s += "display: flex;\n";
	s += "}\n"
	s += ".round-this {\n";
	s += "border-radius: 4px;\n";
	s += "}\n";
	s += ".col-md-2 {\n";
	s += "align-items: center;\n";
	s += "flex-wrap: wrap;\n";
	s += "display: flex;\n";
	s += "}\n";
	s += ".nameentry {\n";
	if(co.trainerColor != "")
		s += "background-color:" + co.trainerColor + ";\n";
	s += "margin: 10px 0px;\n";
	s += "}\n"
	s += ".img-fluid {\n";
	s += "margin: 10px 10px;\n";
	//s += "width: 50%;\n";
	//s += "position: absolute;\n";
	//s += "margin: 0 auto;\n";
	/*s += "top: 0;\n"
	s += "bottom: 0;\n"
	s += "left: 0;\n"
	s += "right: 0;\n"*/
	s += "}\n"
	s += "</style>\n";
	return s;
}
	

function genHtml(title, cssOptions, trainers, teams)
{
	function nameRow(name, n)
	{
		return "<div class=\"row\"><div class=\"col-lg-12 nameentry round-this text-center\">" +
				+ n + ". " + name.trim() +
				"</div></div>\n";
	}
	function monCol(mon)
	{
		//return "<div class=\"col-md-2\"><img align=\"center\" src=\"" + iconUrl + mon + ".png\"></img></div>\n"
		return "<div class=\"col-md-2 text-center\"><img class=\"img-fluid\" src=\"" + dwUrl + mon.trim().toLowerCase() + ".png\"></img></div>\n"
	}

	var s = bootstrapHeader;
	s += genCss(cssOptions);
	s += "<body><div class=\"container\">";
	s += "<div class=\"jumbotron\"><h1 align=\"center\">" + title + "</h1></div>"

	for(var i = 0; i < teams.length; i++)
	{
		s += nameRow(trainers[i], i+1);
		s += "<div class=\"row monentry round-this\">";
		s += teams[i].map(monCol).reduce(function(a,b){return a+b;});
		s += "</div>";
	}
	s += "</div></body></html>"
	return s;
}

function submitTeams()
{
	var text = document.getElementById("teamsInput").value;
	var input = text.split("\n").map(function(s){return s.split(",");});
	var trainers = input.map(function(x){return x[0];});
	var teams = input.map(function(x){return x.slice(1);});
	var title = document.getElementById("title").value;
	var bg = document.getElementById("bg").value;
	var bgImage = document.getElementById("bgImage").value;
	var header = document.getElementById("header").value;
	var textColor = document.getElementById("textColor").value;
	var headerTextColor = document.getElementById("headerTextColor").value;
	var font = document.getElementById("font").value;
	textColor = textColor == "" ? "#000000" : textColor;
	headerTextColor = headerTextColor == "" ? textColor : headerTextColor;
	var cssOptions = [];
	cssOptions.bg = bg;
	cssOptions.bgImage = bgImage;
	cssOptions.header = header;
	cssOptions.textColor = textColor;
	cssOptions.headerTextColor = headerTextColor;
	cssOptions.font = font;
	cssOptions.headerColor = document.getElementById("headerColor").value;
	cssOptions.trainerColor = document.getElementById("trainerColor").value;
	cssOptions.monColor = document.getElementById("monColor").value;
	//TODO add options for background mons, names, possibly images
	var s = genHtml(title, cssOptions, trainers, teams);
	var link = document.getElementById("link");
	link.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(s));
	link.setAttribute("download", (title == "" ? "result" : title) + ".html");
	link.hidden = false;
}

window.onload = function()
{
}
