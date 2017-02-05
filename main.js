window.onload = function()
{
	console.log("yo");
}

function push()
{
	console.log("posting!");
	var name = $("input")[0].value;
	var icon = $("input")[1].value;
	var text = $("input")[2].value.toLowerCase();




	var x = $.ajax(
			{
				url: "https://discordapp.com/api/webhooks/277159899174010880/TMlj-Rm8PCoJDiVPzIvYv4pW-XXrz2XAJCxSJBZ1CVD0pXjNQNlnJRhHlcrMP9GY1Uxv",
				data: JSON.stringify(
					{"content": text,
					 "tts": "true",
					 "avatar_url": icon,
					 "username": name
					}),
				dataType: "json",
				contentType: "application/json",
				method: "POST",
				error: function(a, b, c) {console.log("oh no ", b);}
			});

	console.log(x);
}
