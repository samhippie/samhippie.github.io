function calc()
{
	hp = parseInt($("#hp").val());
	hits = [1,2,3,4].map(n => $("#hit" + n)).map(h => h.val()).filter(h => h);
	rolls = [0];
	hits.forEach(function(hit)
			{
				newRolls = []
				hit = hit.substring(1, hit.length - 1).split(",");
				rolls.forEach(function(r)
						{
							hit.forEach(function(h)
									{
										newRolls.push(r + parseInt(h))
									});
						});
				rolls = newRolls;
			});
	console.log(rolls.length);
	kos = rolls.filter(r => r >= hp).length;
	text = "Percentage: " + (100.0 * kos / rolls.length) + "%";
	$("#percentage").text(text);
	text = "Fraction: " + kos + "/" + rolls.length;
	$("#fraction").text(text);
}
