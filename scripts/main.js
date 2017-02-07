//Created by Matthieu Lepers
// Turtle:    {"axiome":"F","rules":["\"F\": \"F+F-F++F-F+F\""],"config":{"etatInitial":{"position":{"x":300,"y":300},"cap":0},"longueurPas":5,"factEch":0.3333333333333333,"angle":1.0471975511965976,"symboles":"F+-"},"n":6}
// Hexagones: {"axiome":"F+F","rules":["\"F\": \"F-F+F-F+F-F\""],"config":{"etatInitial":{"position":{"x":800,"y":100},"cap":0},"longueurPas":5,"factEch":0.3333333333333333,"angle":0.5235987755982988,"symboles":"F+-"},"n":6}
// Flower:    {"axiome":"F+F","rules":["\"F\": \"F-F+F-F\""],"config":{"etatInitial":{"position":{"x":800,"y":100},"cap":0},"longueurPas":5,"factEch":0.3333333333333333,"angle":0.5235987755982988,"symboles":"F+-"},"n":6}
Array.prototype.head = function() {return this[0];};
Array.prototype.tail = function() {var res = new Array();for (var i = 1; i < this.length; i++)res.push(this[i]);return res;};
Array.prototype.last = function() {return this[this.length - 1];};
Array.prototype.init = function() {var res = new Array();for (var i = 0; i < this.length - 1; i++)res.push(this[i]);return res;};
Array.prototype.setHead = function(element) {return [element].concat(this);};
Array.prototype.setLast = function(element) {this.push(element); return this;};

// Question 1
function motSuivant(rules, word)
{
	var res = '';
	
	for (var i = 0; i < word.length; i++)
		res += rules(word.toUpperCase().charAt(i));
	
	return res;
}

// Question 2
function flocon(sym)
{
	if (sym == 'F')
		return 'F-F++F-F';
	else
		return sym;
}

// Question 3
function lsysteme(axiome, rules, n)
{
	var t = new Date().getTime();
	var res = [];
	var ax = axiome;
	
	for (var i = 0; i < n; i++)
	{
		res.push(ax.toUpperCase());
		ax = motSuivant(rules, ax.toUpperCase());
	}
	
	console.log('Time: ' + (((new Date().getTime() - t) / 1000).toFixed(2)) + 's');
	return res;
}

// Question 5
function avance(conf, etatTortue)
{
	return {
		position: {
			x: etatTortue.position.x + conf.longueurPas * Math.cos(etatTortue.cap),
			y: etatTortue.position.y + conf.longueurPas * Math.sin(etatTortue.cap)
		},
		cap: etatTortue.cap
	};
}

// Question 6
function tourneADroite(conf, etatTortue)
{
	return {
		position: etatTortue.position,
		cap: etatTortue.cap + conf.angle
	};
}

function tourneAGauche(conf, etatTortue)
{
	return {
		position: etatTortue.position,
		cap: etatTortue.cap - conf.angle
	};
}

// Question 7
function filtreSymbolesTortue(conf, word)
{
	var res = '';
	
	for (var i = 0; i < word.length; i++)
		if (conf.symboles.indexOf(word.charAt(i)) != -1)
			res += word.charAt(i)
	
	return res;
}

// Question 8
function interpreteSymbole(conf, etatDessin, sym)
{
	switch (sym)
	{
		case 'F': //[paths.head().concat([A]), paths.tail()]
			var nouvelEtatTortue = avance(conf, etatDessin.etatTortues.head());
			return {
				etatTortues: etatDessin.etatTortues.setHead(nouvelEtatTortue),
				paths: [etatDessin.paths.head().concat([nouvelEtatTortue.position])].concat(etatDessin.paths.tail())
			};
		case '+':
			return {
				etatTortues: etatDessin.etatTortues.setHead(tourneAGauche(conf, etatDessin.etatTortues.head())),
				paths: etatDessin.paths
			};
		case '-':
			return {
				etatTortues: etatDessin.etatTortues.setHead(tourneADroite(conf, etatDessin.etatTortues.head())),
				paths: etatDessin.paths
			};
		case '[': //paths.concat(paths.head().tail())
			var newn = (etatDessin.paths.head().length == 1 ? etatDessin.paths.head() : etatDessin.paths.head().tail());
			return {
				etatTortues:  etatDessin.etatTortues.setLast(etatDessin.etatTortues.head()),
				paths: etatDessin.paths.concat([newn])
			};
		case ']': //paths = [paths.last(), paths.init()]
			return {
				etatTortues: [etatDessin.etatTortues.last()].concat(etatDessin.etatTortues.init()),
				paths: [etatDessin.paths.last()].concat(etatDessin.paths.init())
			};
		default:
			console.warn('Symbole "' + sym + '" is not a recognized symbole!');
	}
}

// Question 9
function interpreteMot(conf, word)
{
	var res = [];
	var syms = filtreSymbolesTortue(conf, word);
	var etatDessin = {etatTortues: [conf.etatInitial], paths: [[conf.etatInitial.position]]};
	
	for (var i = 0; i < syms.length; i++)
	{
		var nouvelEtatDessin = interpreteSymbole(conf, etatDessin, syms.charAt(i));
		//console.log('--------------------------------------------------------------');
		//console.log(syms.charAt(i) + ' = ' + JSON.stringify(nouvelEtatDessin.paths.tail()));
		res = nouvelEtatDessin.paths;
		etatDessin = nouvelEtatDessin;
	}
	
	return res;
}

function drawLine(a, b)
{
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
}

function dessine(paths)
{
	var t = new Date().getTime();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < paths.length; i++)
		if (paths[i].length > 1)
			for (var j = 0; j < paths[i].length - 1; j++)
				drawLine(paths[i][j], paths[i][j + 1]);
	console.log('Draw time: ' + (((new Date().getTime() - t) / 1000).toFixed(2)) + 's');
}

function animLSysteme(conf, lsys)
{
	if (index < lsys.length)
	{
		dessine(interpreteMot(conf, lsys[index]));
		ctx.font = '32px serif';
		ctx.fillText((index + 1) + '/' + selected.n, canvas.width - 80, canvas.height - 5);
		conf = {etatInitial: conf.etatInitial, longueurPas: conf.longueurPas * conf.factEch, factEch: conf.factEch, angle: conf.angle, symboles: conf.symboles};
		index++;
	}
	else
	{
		index = 0;
		window.clearInterval(timer);
	}
}

/* ----- Parsing ----- */
function parseRules(json)
{
	var object = JSON.parse(json);
	
	return function(sym) {
		var tmp = object;
		
		if (tmp[sym] != null)
			return tmp[sym];
		else
			return sym;
	};
}

function fromURL()
{
	if (document.URL.indexOf('lsystem=') && registeredLSystems.has(document.URL.replace(/.+lsystem=(.+)/, '$1')))
	{
		var lsystem = document.URL.replace(/.+lsystem=(.+)/, '$1');
		document.getElementById('selector').value = lsystem;
		return registeredLSystems.get(lsystem);
	}
	return null;
}

function makeLSystem()
{
	var _axiome = document.getElementById('axiome').value;
	var _rules = document.getElementById('rules').value.split('\n').map(function(x) {return x.split(' -> ').map(function(x) {return '"' + x + '"'}).join(': ');});
	
	var _x = eval(document.getElementById('x').value);
	var _y = eval(document.getElementById('y').value);
	var _cap = eval(document.getElementById('cap').value);
	var _longueurPas = eval(document.getElementById('stepLength').value);
	var _scale = eval(document.getElementById('scale').value);
	var _angle = eval(document.getElementById('angle').value);
	var _symboles = document.getElementById('symboles').value;
	
	return JSON.stringify({
		axiome: _axiome,
		rules: _rules,
		config: {etatInitial: {position: {x: _x, y: _y}, cap: _cap}, longueurPas: _longueurPas, factEch: _scale, angle: _angle, symboles: _symboles},
		n: 6
	});
}

function parseCustom()
{
	var object = JSON.parse(decodeURI(document.URL.split('custom=')[1]));
	
	document.getElementById('axiome').value = object.axiome;
	document.getElementById('rules').value = object.rules.map(function(x) {return x.split(': ').join(' -> ').replace(new RegExp(/"/g), '');}).join('\n');
	document.getElementById('rules').value = object.rules.map(function(x) {return x.split(': ').join(' -> ').replace(new RegExp(/"/g), '');}).join('\n');
	document.getElementById('x').value = object.config.etatInitial.position.x;
	document.getElementById('y').value = object.config.etatInitial.position.y;
	document.getElementById('cap').value = object.config.etatInitial.cap;
	document.getElementById('stepLength').value = object.config.longueurPas;
	document.getElementById('scale').value = object.config.factEch;
	document.getElementById('angle').value = object.config.angle;
	document.getElementById('symboles').value = object.config.symboles;
	
	var rules = '{' + object.rules.join(',') + '}';
	object.rules = parseRules(rules);
	return object;
}

/* ----- Main ----- */
var canvas;
var ctx;
var index = 0;
var registeredLSystems;
var timer = null;
var config;
var lsys;
var selected;

function init()
{
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth - 300;
	canvas.height = window.innerHeight - 10;
	
	ctx = canvas.getContext('2d');
	
	registeredLSystems = new Map();
	
	var vonKoch1 = {
		axiome: 'F',
		rules: parseRules('{"F": "F-F++F-F"}'),
		config: {etatInitial: {position: {x: 100, y: 100}, cap: 0}, longueurPas: 5, factEch: 1/3, angle: Math.PI / 3, symboles: 'F+-'},
		n: 6
	};
	var vonKoch2 = {
		axiome: 'F++F++F++',
		rules: parseRules('{"F": "F-F++F-F"}'),
		config: {etatInitial: {position: {x: 100, y: canvas.height - 260}, cap: 0}, longueurPas: 2, factEch: 1/3, angle: Math.PI / 3, symboles: 'F+-'},
		n: 6
	};
	var hilbert  = {
		axiome: 'X',
		rules: parseRules('{"X": "+YF-XFX-FY+", "Y": "-XF+YFY+FX-"}'),
		config: {etatInitial: {position: {x: canvas.width / 2 - 250, y: canvas.height / 2 + 100}, cap: 0}, longueurPas: 5, factEch: 1/2, angle: Math.PI / 2, symboles: 'F+-'},
		n: 7
	};
	var dragon  = {
		axiome: 'FX',
		rules: parseRules('{"X": "X+YF+", "Y": "-FX-Y"}'),
		config: {etatInitial: {position: {x: canvas.width / 2, y: canvas.height / 2 - 200}, cap: 0}, longueurPas: 5, factEch: 1/2, angle: Math.PI / 2, symboles: 'F+-'},
		n: 14
	};
	var twig = {
		axiome: 'F',
		rules: parseRules('{"F": "F[-F]F[+F]F"}'),
		config: {etatInitial: {position: {x: canvas.width / 2, y: canvas.height}, cap: -Math.PI/2}, longueurPas: 8, factEch: 1/3, angle: 25 * Math.PI / 180, symboles: 'F+-[]'},
		n: 5
	};
	var brush = {
		axiome: 'F',
		rules: parseRules('{"F": "FF-[-F+F+F]+[+F-F-F]"}'),
		config: {etatInitial: {position: {x: canvas.width / 2, y: canvas.height}, cap: -Math.PI/2}, longueurPas: 8, factEch: 2/5, angle: 25 * Math.PI / 180, symboles: 'F+-[]'},
		n: 5
	};
	var fractalTree = {
		axiome: 'F',
		rules: parseRules('{"F": "F[+F][-F]"}'),
		config: {etatInitial: {position: {x: canvas.width / 2, y: canvas.height * 2 / 3}, cap: -Math.PI/2}, longueurPas: 40, factEch: 1/3, angle: Math.PI/6, symboles: 'F+-[]'},
		n: 9
	};
	
	registeredLSystems.set('vonKoch1', vonKoch1);
	registeredLSystems.set('vonKoch2', vonKoch2);
	registeredLSystems.set('hilbert', hilbert);
	registeredLSystems.set('dragon', dragon);
	registeredLSystems.set('twig', twig);
	registeredLSystems.set('brush', brush);
	registeredLSystems.set('fractalTree', fractalTree);
	
	if (document.URL.indexOf('lsystem=') != -1 && document.URL.indexOf('custom') == -1)
	{
		selected = fromURL() || dragon;
		config = selected.config;
		lsys = lsysteme(selected.axiome, selected.rules, selected.n);
		timer = window.setInterval(animLSysteme, 500, config, lsys);
	}
	else if (document.URL.indexOf('custom') != -1)
	{
		selected = parseCustom();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		config = selected.config;
		lsys = lsysteme(selected.axiome, selected.rules, selected.n);
		if (timer != null)
			window.clearInterval(timer);
		timer = window.setInterval(animLSysteme, 500, config, lsys);
	}
	
	document.getElementById('selector').addEventListener('change', function() {
		document.location.replace(encodeURI('index.html?lsystem=' + this.value));
	});
	document.getElementById('drawButton').addEventListener('click', function() {
		document.location.replace(encodeURI('index.html?custom=' + makeLSystem()));
	});
}

window.addEventListener('load', init);
