var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Settings = require('settings');
var username = localStorage["username"];
var platform = localStorage["platform"];
var memId = localStorage["memId"];
var url;
var charData;
var text;
var apiKey = "461d389ee0d547c39357527c6afea244";

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

//var UI = require('ui');
// Logo for splash screen
var logo_image = new UI.Image({
	position: new Vector2(58, 20),
	size: new Vector2(28, 26),
	compositing: 'invert',
	image: 'images/main_logo.png'
});
if(localStorage["username"] === ""){
	// Text element to inform user
	text = new UI.Text({
		position: new Vector2(0, 60),
		size: new Vector2(144, 168),
		text:'Please load your \n character info \n via the config screen \n and restart the app',
		font:'GOTHIC_14_BOLD',
		color:'white',
		textOverflow:'wrap',
		textAlign:'center',
		backgroundColor:'black'
	});
}else{
	// Text element to inform user
	text = new UI.Text({
		position: new Vector2(0, 60),
		size: new Vector2(144, 168),
		text:'Your Characters \n are loading...',
		font:'GOTHIC_14_BOLD',
		color:'white',
		textOverflow:'wrap',
		textAlign:'center',
		backgroundColor:'black'
	});
}

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.add(logo_image);
splashWindow.show();



var hashes = [
	{"hash": "3159615086", "name": "Glimmer"},
	{"hash": "1415355184", "name": "Crucible marks"},
	{"hash": "1415355173", "name": "Vanguard marks"},
	{"hash": "898834093", "name": "Exo"},
	{"hash": "3887404748", "name": "Human"},
	{"hash": "2803282938", "name": "Awoken"},
	{"hash": "3111576190", "name": "Male"},
	{"hash": "2204441813", "name": "Female"},
	{"hash": "671679327", "name": "Hunter"},
	{"hash": "3655393761", "name": "Titan"},
	{"hash": "2271682572", "name": "Warlock"},
	{"hash": "3871980777", "name": "New Monarchy"},
	{"hash": "529303302", "name": "Cryptarch"},
	{"hash": "2161005788", "name": "Iron Banner"},
	{"hash": "452808717", "name": "Queen"},
	{"hash": "3233510749", "name": "Vanguard"},
	{"hash": "1357277120", "name": "Crucible"},
	{"hash": "2778795080", "name": "Dead Orbit"},
	{"hash": "1424722124", "name": "Future War Cult"}
];


Pebble.addEventListener("showConfiguration", function() {
	console.log("showing configuration");
	Pebble.openURL('http://krisjhamilton.github.io/destiny.html');
});

Pebble.addEventListener("webviewclosed", function(e) {
	console.log("configuration closed");
	//http://forums.getpebble.com/discussion/15172/pebblejs-cloudpebble-unexpected-token-c-at-object-parse-json-error
	if(e.response !="CANCELLED") {
		var options = JSON.parse(decodeURIComponent(e.response));
		console.log(options.day);
		console.log("Options = " + JSON.stringify(options));
		var username = options.username;
		localStorage["username"] = username;
		var platform = options.platform;
		localStorage["platform"] = platform;
		//		var url = options.url;
		//		localStorage["url"] = url;
		console.log(username + platform);
	}
});

if(localStorage["username"] === "") {
	return;
}else{


	var parseFeed = function(data) {
		var items = [];

		for(var i = 0; i < data.Response.data.characters.length; i++) {
			var powerLevel = data.Response.data.characters[i].characterBase.powerLevel;
			var classHash = data.Response.data.characters[i].characterBase.classHash;
			var genderHash = data.Response.data.characters[i].characterBase.genderHash;
			var raceHash = data.Response.data.characters[i].characterBase.raceHash;
			var classResult;
			var genderResult;
			var raceResult;

			for(var j in hashes){
				var id = hashes[j].hash;
				var name = hashes[j].name;
				if(id == classHash){
					classResult = name;
				}
				if(id == genderHash){
					genderResult = name;
				}
				if(id == raceHash){
					raceResult = name;
				}
			}

			items.push({
				title: "[ " + powerLevel + " ]" + " " + classResult,//+ platform + username,
				subtitle: genderResult + " " + raceResult
			});
		}
		return items;
	};

	if(username){
		ajax(
			{
				url: "http://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/"+platform+"/"+username+"/",
				type: 'json',
				headers: {

					"X-API-Key": apiKey
				}
			},
			function(data) {
				//console.log(localStorage["username"]);
				// need to put if statement if memId is not available
				var memId = data.Response[0].membershipId;
				localStorage["memId"] = memId;
				//console.log(memId)
				processAllAjaxCalls();
			});
	}

	function processAllAjaxCalls(data) {
		var username = localStorage["username"];
		var platform = localStorage["platform"];
		var memId = localStorage["memId"];
		url = "http://www.bungie.net/Platform/Destiny/"+platform+"/Account/"+memId+"/";
		ajax(
			{
				url: url,
				type: 'json',
				headers: {

					"X-API-Key": apiKey
				}
			}, function(data) {
				charData=data;
				//processAllAjaxCalls(charData);

				if(memId && charData){
					// Create an array of Menu items
					//var url = localStorage["url"];


					// Construct Menu to show to user
					var menuItems = parseFeed(data);
					var resultsMenu = new UI.Menu({
						sections: [{
							title: username,
							items: menuItems
						}]
					});

					// Add an action for SELECT
					resultsMenu.on('select', function(e) {
						//var menuItems2 = parseFeed2(data);
						// Construct Menu to show to user
						var lightLevel = data.Response.data.characters[e.itemIndex].characterBase.powerLevel;
						var baseLevel = data.Response.data.characters[e.itemIndex].baseCharacterLevel;
						var decipline = data.Response.data.characters[e.itemIndex].characterBase.stats.STAT_DISCIPLINE.value;
						var intellect = data.Response.data.characters[e.itemIndex].characterBase.stats.STAT_INTELLECT.value;
						var strength = data.Response.data.characters[e.itemIndex].characterBase.stats.STAT_STRENGTH.value;
						var armor = data.Response.data.characters[e.itemIndex].characterBase.stats.STAT_ARMOR.value;
						var agility = data.Response.data.characters[e.itemIndex].characterBase.stats.STAT_AGILITY.value;
						var recovery = data.Response.data.characters[e.itemIndex].characterBase.stats.STAT_RECOVERY.value;
						var glimmer = data.Response.data.inventory.currencies[0].value;
						var grimoireScore = data.Response.data.grimoireScore;
						var charId = data.Response.data.characters[e.itemIndex].characterBase.characterId;
						var legMarks = data.Response.data.inventory.currencies[1].value;
						var charUrl = "http://www.bungie.net/Platform/Destiny/"+ platform +"/Account/"+ memId +"/Character/"+ charId +"/progression/";
						console.log(charUrl);
						produceNow();
						function produceNow(){
							ajax(
								{
									url: charUrl,
									type: 'json',
									headers: {
										"X-API-Key": apiKey
									}
								}, function(data3) {
									var cryptLv = data3.Response.data.progressions[12].level;
									var cryptProg = data3.Response.data.progressions[12].progressToNextLevel;
									var cryptNext = data3.Response.data.progressions[12].nextLevelAt;
									var vanLv = data3.Response.data.progressions[16].level;
									var vanProg = data3.Response.data.progressions[16].progressToNextLevel;
									var vanNext = data3.Response.data.progressions[16].nextLevelAt;
									var cruLv = data3.Response.data.progressions[17].level;
									var cruProg = data3.Response.data.progressions[17].progressToNextLevel;
									var cruNext = data3.Response.data.progressions[17].nextLevelAt;
									var deadLv = data3.Response.data.progressions[18].level;
									var deadProg = data3.Response.data.progressions[18].progressToNextLevel;
									var deadNext = data3.Response.data.progressions[18].nextLevelAt;
									var futLv = data3.Response.data.progressions[19].level;
									var futProg = data3.Response.data.progressions[19].progressToNextLevel;
									var futNext = data3.Response.data.progressions[19].nextLevelAt;
									var newMLv = data3.Response.data.progressions[20].level;
									var newMProg = data3.Response.data.progressions[20].progressToNextLevel;
									var newMNext = data3.Response.data.progressions[20].nextLevelAt;
									var houseLv = data3.Response.data.progressions[24].level;
									var houseProg = data3.Response.data.progressions[24].progressToNextLevel;
									var houseNext = data3.Response.data.progressions[24].nextLevelAt;
									var queenLv = data3.Response.data.progressions[25].level;
									var queenProg = data3.Response.data.progressions[25].progressToNextLevel;
									var queenNext = data3.Response.data.progressions[25].nextLevelAt;
									var gunLv = data3.Response.data.progressions[26].level;
									var gunProg = data3.Response.data.progressions[26].progressToNextLevel;
									var gunNext = data3.Response.data.progressions[26].nextLevelAt;
									var crotaLv = data3.Response.data.progressions[13].level;
									var crotaProg = data3.Response.data.progressions[13].progressToNextLevel;
									var crotaNext = data3.Response.data.progressions[13].nextLevelAt;


									//console.log(vanExp);
									var charDetails = new UI.Menu({
										sections: [{
											title: e.item.title,
											items: [{
												title: "Base Level",
												subtitle: baseLevel
											},{
												title: "Light Level",
												subtitle: lightLevel
											},{
												title: "Glimmer",
												subtitle: glimmer + " / 25000"
											},{
												title: "Grimoire Score",
												subtitle: grimoireScore
											},{
												title: "Legendary Marks",
												subtitle: legMarks
											}]
										},{
											title: "Reputation",
											items: [{
												title: "Vanguard Level",
												subtitle: vanLv
											},{
												title: "Vanguard Exp",
												subtitle: vanProg + " / " + vanNext
											},{
												title: "Cruicible Level",
												subtitle: cruLv
											},{
												title: "Cruicible Exp",
												subtitle: cruProg + " / " + cruNext
											},{
												title: "Cryptarch Level",
												subtitle: cryptLv
											},{
												title: "Cryptarch Exp",
												subtitle: cryptProg + " / " + cryptNext
											},{
												title: "Gunsmith Level",
												subtitle: gunLv
											},{
												title: "Gunsmith Exp",
												subtitle: gunProg + " / " + gunNext
											},{
												title: "House of Judgement Level",
												subtitle: houseLv
											},{
												title: "House of Judgement Exp",
												subtitle: houseProg + " / " + houseNext
											},{
												title: "Queens Wrath Level",
												subtitle: queenLv
											},{
												title: "Queens Wrath Exp",
												subtitle: queenProg + " / " + queenNext
											},{
												title: "Crotas Bane Level",
												subtitle: crotaLv
											},{
												title: "Crotas Bane Exp",
												subtitle: crotaProg + " / " + crotaNext
											},{
												title: "Future War Cult Level",
												subtitle: futLv
											},{
												title: "Future War Cult Exp",
												subtitle: futProg + " / " + futNext
											},{
												title: "Dead Orbit Level",
												subtitle: deadLv
											},{
												title: "Dead Orbit Exp",
												subtitle: deadProg + " / " + deadNext
											},{
												title: "New Monarchy Level",
												subtitle: newMLv
											},{
												title: "New Monarchy Exp",
												subtitle: newMProg + " / " + newMNext
											}]
										},{
											title: "Primary Stats",
											items: [{
												title: "Intellect",
												subtitle: intellect
											},{
												title: "Decipline",
												subtitle: decipline
											},{
												title: "Strength",
												subtitle: strength
											}]
										},{
											title: "Secondary Stats",
											items: [{
												title: "Armor",
												subtitle: armor + " / 10"
											},{
												title: "Agility",
												subtitle: agility + " / 10"
											},{
												title: "Recovery",
												subtitle: recovery + " / 10"
											}]
										}]
									});
									charDetails.show();
								});
						}
					});
					resultsMenu.show();
					splashWindow.hide();
				}
			}
		);
	}
}
