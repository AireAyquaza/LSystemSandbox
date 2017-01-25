//Created by Matthieu Lepers
//{"axiome":"F","rules":["\"F\": \"F+F-F++F-F+F\""],"config":{"etatInitial":{"position":{"x":300,"y":300},"cap":0},"longueurPas":5,"factEch":0.3333333333333333,"angle":1.0471975511965976,"symboles":"F+-"},"n":6}
String.prototype.asList = function() {return this.split('');}

String.prototype.head = function() {return this.charAt(0);}
String.prototype.tail = function() {return this.substring(1);}

// Question 1
function motSuivant(rules, word)
{
	var res = '';
	var i = 0;
	
	while (word.charAt(i) != '')
	{
		res += rules(word.toUpperCase().charAt(i));
		i++;
	}
	
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
	var res = [];
	var ax = axiome;
	
	for (var i = 0; i < n; i++)
	{
		res.push(ax.toUpperCase());
		ax = motSuivant(rules, ax.toUpperCase());
	}
	
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
	if (sym == 'F')
	{
		var nouvelEtat = avance(conf, etatDessin.etatTortue);
		return {
			etatTortue: nouvelEtat,
			path: [nouvelEtat.position].concat(etatDessin.path)
		};
	}
	else if (sym == '+')
		return {
			etatTortue: tourneAGauche(conf, etatDessin.etatTortue),
			path: etatDessin.path
		};
	else if (sym == '-')
		return {
			etatTortue: tourneADroite(conf, etatDessin.etatTortue),
			path: etatDessin.path
		};
}

// Question 9
function interpreteMot(conf, word)
{
	var res = [];
	var syms = filtreSymbolesTortue(conf, word);
	var etatDessin = {etatTortue: conf.etatInitial, path: []};
	
	for (var i = 0 ; i < syms.length; i++)
	{
		var nouvelEtatDessin = interpreteSymbole(conf, etatDessin, syms.charAt(i));
		res = nouvelEtatDessin.path;
		
		etatDessin = nouvelEtatDessin;
	}
	res.push(conf.etatInitial.position);
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

function dessine(path)
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < path.length - 1; i++)
		drawLine(path[i], path[i + 1]);
}

function animLSysteme(conf, lsys)
{
	if (index < lsys.length)
	{
		dessine(interpreteMot(conf, lsys[index]));
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
	var _rules = document.getElementById('rules').value.split('\n').map(function(x) {return x.replace(/([A-Z-+]+) -> ([A-Z-+]+)/, '"$1": "$2"');});
	
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
	var object = JSON.parse(decodeURI(document.URL.replace(/.+custom=(.+)/, '$1')).replace(/\//g,''));
	
	document.getElementById('axiome').value = object.axiome;
	document.getElementById('rules').value = object.rules.map(function(x) {return x.replace(new RegExp('"([A-Z-+]+)": "([A-Z-+]+)"'), '$1 -> $2');}).join('\n');
	document.getElementById('x').value = object.config.etatInitial.position.x;
	document.getElementById('y').value = object.config.etatInitial.position.y;
	document.getElementById('cap').value = object.config.etatInitial.cap;
	document.getElementById('stepLength').value = object.config.longueurPas;
	document.getElementById('scale').value = object.config.factEch;
	document.getElementById('angle').value = object.config.angle;
	document.getElementById('symboles').value = object.config.symboles;
	
	var rules = object.rules.map(function(x) {return '{' + x + '}';}).join(',');
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
	
	registeredLSystems.set('vonKoch1', vonKoch1);
	registeredLSystems.set('vonKoch2', vonKoch2);
	registeredLSystems.set('hilbert', hilbert);
	registeredLSystems.set('dragon', dragon);
	
	if (document.URL.indexOf('lsystem=') != -1 && document.URL.indexOf('custom') == -1)
	{
		selected = fromURL() || dragon;
		config = selected.config;
		lsys = lsysteme(selected.axiome, selected.rules, selected.n);
		timer = window.setInterval(animLSysteme, 500, config, lsys);
	}
	else if (document.URL.indexOf('custom') != -1)
	{
		var custom_lsystem = parseCustom();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		config = custom_lsystem.config;
		lsys = lsysteme(custom_lsystem.axiome, custom_lsystem.rules, custom_lsystem.n);
		if (timer != null)
			window.clearInterval(timer);
		timer = window.setInterval(animLSysteme, 500, config, lsys);
	}
	
	document.getElementById('selector').addEventListener('change', function()
	{
		document.location.replace(encodeURI('index.html?lsystem=' + this.value));
	});
	document.getElementById('drawButton').addEventListener('click', function() {
		document.location.replace(encodeURI('index.html?custom=' + makeLSystem()));
	});
}

window.addEventListener('load', init);
