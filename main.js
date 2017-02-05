window.onload = function()
{
	console.log("yo");
}

function push()
{
	console.log("posting!");
	var icon = $("icon")[0].value;
	var name = $("name")[0].value;
	var x = $.ajax(
			{
				url: "https://discordapp.com/api/webhooks/277159899174010880/TMlj-Rm8PCoJDiVPzIvYv4pW-XXrz2XAJCxSJBZ1CVD0pXjNQNlnJRhHlcrMP9GY1Uxv",
				//url: "https://posttestserver.com/post.php",
				data: JSON.stringify(
					{"content": $("input")[0].value,
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
