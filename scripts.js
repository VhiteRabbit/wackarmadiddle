/** Initial Variables **/

var positions = [
"-0.46024 0.43058 -0.92588",
"-1.19726 0.28986 -0.67284",
"-1.23825 0.28234 0.52940",
"-0.98187 0.25601 1.23786",
"-0.25130 0.32843 1.49978",
"0.44158 0.33252 1.01640",
"1.14151 0.19230 1.07521",
"1.49075 0.32847 0.10647",
"1.69524 0.31715 -0.41135",
"1.08046 0.26422 -1.14151",

"-1.02931 0.87022 -0.78663",
"-1.41416 0.91802 -0.34148",
"-1.05239 0.89277 0.26526",
"-1.04791 0.91710 0.99895",
"-0.85960 1.16636 1.49199",
"-0.03963 1.05628 1.47910",
"0.53958 1.13737 1.28999",
"1.14150 1.06304 1.06912",
"1.39145 1.27896 0.18262",
"1.38151 0.99329 -0.29432",
"0.92318 1.00883 -1.05192",

"0.25559 1.24071 -0.46539",
"-0.60127 1.18955 -0.34826",
"-0.74047 1.28953 0.25492",
"-0.26752 1.30594 0.12327",
"1.12024 1.44018 -0.34314"]

var idlePosition = "300 300 300"; 

var spawnedAtPosition = [];

for(var i = 0; i < positions.length; i++){
	spawnedAtPosition.push(false); //Array(positions.length).fill(false);
}

var inactiveArmadillos = [];

var gameStarted = false;

var score = 0;

var spawnSpeed = 2000;

/** Components **/

AFRAME.registerComponent('game-manager', {
  schema: {},
  init: function () {

	for(var i = 0; i < 20; i++){
		var el = document.createElement('a-gltf-model');
		var sceneEl = document.querySelector('a-scene');
		
		var rand = Math.floor(Math.random() * positions.length);
		while(spawnedAtPosition[rand])
		{
			rand = Math.floor(Math.random() * positions.length);
		}
		
		el.setAttribute('class','clickable ');
		el.setAttribute('armadillo','');
		el.setAttribute('position', idlePosition);
		el.setAttribute('look-at','#origin');
		el.setAttribute('src','#armadillo');
		el.setAttribute('index', -1);

		sceneEl.appendChild(el);
		
		inactiveArmadillos.push(el);
	}
  
	this.tick = AFRAME.utils.throttleTick(this.tick, spawnSpeed, this);
  },

  tick: function () {
	if(!gameStarted)
		return;
  
	if(inactiveArmadillos.length > 0){
		var el = inactiveArmadillos.pop();
		el.components.armadillo.spawn();
	}
	
	}
});

AFRAME.registerComponent('armadillo', {
  schema: {
	lifeTime: { type: 'number', default: 5000.0 },
	alive: {type: 'boolean', default: false}
  },
  
  init: function () {
	this.el.addEventListener('click', this.onClicked.bind(this));
  },

	
  onClicked: function (){
	document.querySelector('a-scene').querySelector('#score').components.score.increment();
	this.destroy();
  },

  tick: function (time, timeDelta) {
	if(!this.data.alive)
		return;
  
	this.data.lifeTime -= timeDelta;
	if(this.data.lifeTime < 0)
		this.destroy();
  },
  
  spawn: function(){
	var rand = Math.floor(Math.random() * positions.length);
	while(spawnedAtPosition[rand])
	{
		rand = Math.floor(Math.random() * positions.length);
	}
	this.el.setAttribute('position', positions[rand]);
	spawnedAtPosition[rand] = true;		
	this.el.setAttribute('index', rand);
	
	this.data.lifeTime = 5000.0;
	this.data.alive = true;
  },
  
  destroy: function(){
	this.el.setAttribute('position', idlePosition);
	spawnedAtPosition[this.el.getAttribute('index')] = false;
	this.el.setAttribute('index', -1);
	this.data.alive = false;
	inactiveArmadillos.push(this.el);
  }
});

AFRAME.registerComponent('start-button', {
	schema: {
		color: {default: 'red'}
	},

	init: function () {
		var data = this.data;
		var el = this.el;
		var defaultColor = 'grey';

		el.addEventListener('click', function (e) {			
			console.log('clicked');
			StartGame();
			el.parentNode.parentNode.removeChild(el.parentNode);
		});
		  
		el.addEventListener('mouseenter', function () {
			el.setAttribute('color', data.color);
		});

		el.addEventListener('mouseleave', function () {
			el.setAttribute('color', defaultColor);
		});
	}
});

var timer =  5000;

AFRAME.registerComponent('timer', {
	schema: {default: false},
	tick: function (time, timeDelta) {
		if(this.data){
			var el = this.el;
			timer -= timeDelta;
			el.setAttribute("value", GetTimeText(timer));
		}
		if(timer <= 0 && gameStarted){
			StopTimer();
			EndGame();
			el.setAttribute("value", "Fin!");
		}
	}
});

AFRAME.registerComponent('score', {
	increment: function(){
		score++;
		this.el.setAttribute("value", score);
	}
});

/** Helper Functions **/

StartGame = function(){
	gameStarted = true;
	StartTimer();
}

EndGame = function(){
	gameStarted = false;

	var sceneEl = document.querySelector('a-scene');

	
	var armadillos = sceneEl.querySelectorAll('[armadillo]');
/* TODO: destroy all armadillos that are still alive
	console.log(armadillos.length)
	
	for(var i = 0; i < armadillos.length; i++){
		if(armadillos[i].components.armadillo.alive === true)
			armadillos[i].components.armadillo.destroy();

	}*/
}

ResetTimer = function (){
	timer = 60000;
}

StartTimer = function (){
	document.querySelector('a-scene').querySelector('#timer').setAttribute("timer", "true");
}

StopTimer = function (){
	document.querySelector('a-scene').querySelector('#timer').setAttribute("timer", "false");
}

GetTimeText = function (time) {
	var secs = Math.ceil(time / 1000);
	var mins = Math.floor(secs / 60);
	secs = secs % 60;
	return mins + ":" + secs.pad();
}

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}
