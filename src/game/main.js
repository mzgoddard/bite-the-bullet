(function(window, load) {

window.glider = {};

var when = window.when;

load.module('game/main.js',
  load.chain(load.script('engine/init.js'),
    function() {
      return load.script('game/glider.js');
    }
  ),
function() {

var Sizzle = window.Sizzle,
    when = window.when,
    aqua = window.aqua;


aqua.game = aqua.Game.create();

aqua.game.graphics = aqua.initGraphics(Sizzle('canvas')[0]);
aqua.game.graphics.addShader({name: 'basic', path:'shaders/basic'});
aqua.game.task(aqua.game.call.bind(aqua.game, 'render'), aqua.Game.Priorities.RENDER);
aqua.game.task(aqua.game.graphics.draw.bind(aqua.game.graphics), aqua.Game.Priorities.RENDER);

aqua.game.timing = {
  delta: 0,
  last: Date.now()
};
aqua.game.task(function() {
  var now = Date.now();
  aqua.game.timing.delta = (now - aqua.game.timing.last) / 1000;
  aqua.game.timing.last = now;
}, -10);

aqua.game.world = aqua.World.create(aqua.Box.create(750, 1000, 0, 0));
aqua.game.add(aqua.game.world);

var test = aqua.GameObject.create();
test.add(aqua.type(aqua.Component, {fixedUpdate: function(){console.log('fixed');}}).create());
aqua.game.add(test);

aqua.game.graphics.addDrawCall(aqua.PriorityItem.create(function(graphics, gl) {
  // graphics setup (once)
  gl.clearColor(0, 22 / 255, 55 / 255, 255 / 255);
  graphics.useShader('basic');
}, -1000, false, true));

aqua.game.graphics.addDrawCall(aqua.PriorityItem.create(function(graphics, gl) {
  var width = window.innerWidth,
      height = window.innerHeight;
  
  graphics.canvas.width = width;
  graphics.canvas.height = height;
  
  gl.viewport(0, 0, width, height);
  mat4.ortho(
    0, width, 0, height, 0, 1000,
    graphics.projection);
  
  // graphics setup
  gl.clear(gl.COLOR_BUFFER_BIT);
  graphics.useShader('basic');
}, -1000));

// aqua.game.task(function(){console.log('beep');});

aqua.game.add(glider.makeGlider());

function loop() {
  aqua.requestAnimFrame.call(null, loop);
  
  aqua.game.step();
}
loop();

});
})(this, this.load);
