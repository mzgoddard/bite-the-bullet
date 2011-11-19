(function(window, load) {
load.module('game/main.js',
  load.script('engine/init.js'),
function() {

var Sizzle = window.Sizzle,
    aqua = window.aqua;

aqua.game = aqua.Game.create();
aqua.game.graphics = aqua.initGraphics(Sizzle('canvas')[0]);
aqua.game.graphics.addShader({name: 'basic', path:'shaders/basic'});
aqua.game.task(function(){console.log('beep');});

function loop() {
  aqua.requestAnimFrame.call(null, loop);
  
  aqua.game.step();
}
loop();

});
})(this, this.load);