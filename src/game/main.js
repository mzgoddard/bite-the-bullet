load.module('game/main.js',
  load.script('engine/init.js'),
(function(window) {

aqua.initGraphics(Sizzle('canvas')[0]);
aqua.graphics.addShader({name: 'basic', path:'shaders/basic'});

}).bind(this));