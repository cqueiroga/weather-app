let cityState = "Glen Burnie, Maryland";
let latitude = "39.1702"; // Glen Burnie
let longitude = "-76.5798"; // Glen Burnie
let lines = [];
let forecast = "https://api.weather.gov/gridpoints/LWX/111,86/forecast";
let ctx = "";

$(document).ready(function () {
	getLocation();
	getPointsWeatherAPI();

	let file = $.get(
		"US.txt",
		function (data) {
			splitData(data);
		},
		"text"
	);

	$("#searchBtn").click(function () {
		let zipCode = $("#zipCodeInput").val();
		getLatLong(zipCode);
		updateWeeklyWeather();
	});
});

// Split each line and tab delimited into it's own array
function splitData(data) {
	data = data.split(/\r?\n/);
	let newLines = [];
	lines = [];
	for (line in data) {
		newLines.push(data[line].split(/\n/));
	}
	for (tab in newLines) {
		lines.push(data[tab].split(/\t/));
	}
}

// Get latitude, longitude, city and state from array
function getLatLong(zipCode) {
	for (key in lines) {
		if (zipCode == lines[key][1]) {
			cityState = lines[key][2] + ", " + lines[key][3];
			latitude = lines[key][9];
			longitude = lines[key][10];
		}
	}
}

// Get user current location
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		x.innerHTML = "Geolocation is not supported by this browser.";
	}
}

// Declare latitude and longitude for current location
function showPosition(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
}

// Get weather API
function getPointsWeatherAPI() {
	// local test
	// $.getJSON( "js/weatherapi.json", function(response) {
	//   console.log(response)
	//   let periods = response.properties.periods
	//   $(".weekly-temperature-container").remove()
	//   for(key in periods) {
	//       ctx = periods[key]
	//       getTodaysTemp(ctx)
	//       getWeeklyTemp(key, ctx)
	//   }
	// })

	$.ajax({
		async: true,
		crossDomain: true,
		url: `https://api.weather.gov/points/${latitude},${longitude}`,
		method: "GET",
	}).done(function (response) {
		forecast = response.properties.forecast;

		$.ajax({
			async: true,
			crossDomain: true,
			url: forecast,
			method: "GET",
		}).done(function (response) {
			let periods = response.properties.periods;
			console.log(periods);
			for (key in periods) {
				ctx = periods[key];
				getTodaysTemp(ctx);
				getWeeklyTemp(key, ctx);
			}
		});
	});
}

// Get todays temp from API
function getTodaysTemp(ctx) {
	if (ctx.number == 1) {
		displayTodaysTemp(ctx);
	}
}

// Display todays temp
function displayTodaysTemp(ctx) {
	let sunnybg = "/images/sunny-bg1.jpg";
	let clearskybg = "/images/clearsky-bg.jpg";
	let nightcloudybg = "/images/nightcloudy-bg.jpg";
	if (ctx.isDaytime) {
		if (ctx.shortForecast == "Sunny" || ctx.shortForecast == "Partly Sunny") {
			$(".background-container").css(
				"background-image",
				"url(" + sunnybg + ")"
			);
		} else if (
			ctx.shortForecast == "Clear" ||
			ctx.shortForecast == "Mostly Clear"
		) {
			$(".background-container").css(
				"background-image",
				"url(" + clearskybg + ")"
			);
		} else if (
			ctx.shortForecast == "Sunny" ||
			ctx.shortForecast == "Partly Sunny"
		) {
			$(".background-container").css(
				"background-image",
				"url(" + sunnybg + ")"
			);
		}
	}

	if (!ctx.isDaytime) {
		$(".background-container").css(
			"background-image",
			"url(" + nightcloudybg + ")"
		);
	}

	$("#location").text(cityState);
	$("#location").after(
		`<h3 class="temperature" id="todayTemp">${ctx.temperature}&degF</h3>`
	);
	$("#todayShortForecast").text(ctx.shortForecast);
}

// Display location pull from API
function displayLocation(cityState) {
	$("#location").text(cityState);
}

// Get weekley temperatures
function getWeeklyTemp(key, ctx) {
	if (key <= 7) {
		displayWeeklyTemp(ctx);
	}
}

// Display weekley temperatures
function displayWeeklyTemp(ctx) {
	$("#weekly-temperature-content").append(`
    <div class="weekly-temperature-container">
      <p class="weekday">${ctx.name}</p>
      <img src="${ctx.icon}" />
      <p class="weeklyTemp">${ctx.temperature}&degF</p>
    </div>
  `);
}

function updateWeeklyWeather() {
	$("#todayTemp").remove();
	$(".weekly-temperature-container").remove();
	getPointsWeatherAPI();
}
