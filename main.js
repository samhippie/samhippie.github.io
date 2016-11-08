$(document).ready(function()
	{
		var states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
		          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
				            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
							          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
									            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
		var styles = {};
		var rcount = 0;
		var dcount = 0;
		var bystate = "";
		states.forEach(function(st)
				{
					isRed = Math.random() < 0.5;
					if(isRed)
					{
						rcount += ec[st];
						bystate += st + ": R<br>";
					}
					else
					{
						dcount += ec[st];
						bystate += st + ": D<br>";
					}
					styles[st] = 
					{
						fill: isRed?"red":"blue", 
						stroke:"#666", 
						"stroke-width":1, 
						"stroke-linejoin":"round",
						scale:[1,1]
					};
				});
		//$('#map').usmap({});
		var m = $('#map').usmap({
			stateSpecificStyles: styles
		});
		$("#rcount").html(rcount);
		$("#dcount").html(dcount);
		$("#bystate").html(bystate);
		var k = Math.round(9000000 * Math.random() + 1000000);
		k = k.toString();
		while(k.length < 7)
			k = "0" + k;
		$("#kek").text(k);
	});
