(function(window, load) {

window.glider = {};
window.btb = {};

var when = window.when;

load.module('game/main.js',
  load.chain(load.script('engine/init.js'),
    function() {
      return when.all([
        load.script('game/ship.js'),
        load.script('game/enemy.js'),
        load.script('game/level.js'),
        load.script('game/common.js')
      ]);
    }
  ),
function() {
setTimeout(function() {
var $ = window.$,
    when = window.when,
    mat4 = window.mat4,
    aqua = window.aqua,
    glider = window.glider;


aqua.game = aqua.Game.create();

paper.setup($('canvas')[0]);
paper.view.viewSize.width=800;
paper.view.viewSize.height=600;
aqua.game.task(paper.view.draw.bind(paper.view), aqua.Game.Priorities.RENDER);

//var path = new paper.Path.RoundRectangle(new paper.Rectangle(10, 10, 50, 50), new paper.Size(10, 10));
//path.strokeColor = 'black';

aqua.game.graphics = aqua.Graphics.create();
// aqua.game.graphics = aqua.initGraphics($('canvas')[0]);
// aqua.game.graphics.addShader({name: 'basic', path:'shaders/basic'});
// aqua.game.task(aqua.game.call.bind(aqua.game, 'render'), aqua.Game.Priorities.RENDER);
// aqua.game.task(aqua.game.graphics.draw.bind(aqua.game.graphics), aqua.Game.Priorities.RENDER);

aqua.game.timing = {
  delta: 0,
  last: Date.now()
};
aqua.game.task(function() {
  var now = Date.now();
  aqua.game.timing.delta = Math.clamp((now - aqua.game.timing.last) / 1000, 0, 0.3);
  aqua.game.timing.last = now;
}, -10);

aqua.game.world = aqua.World.create(aqua.Box.create(600, 800, 0, 0));
aqua.game.add(aqua.game.world);
// aqua.game.world.add(aqua.World.PaperRenderer.create());

aqua.game.player = btb.makeShip();
aqua.game.add(aqua.game.player);

// aqua.game.add(btb.makeEnemy({move:{},attack:{},render:{}}));
aqua.game.levelManager = btb.LevelManager.makeLevelManager();
aqua.game.add(aqua.game.levelManager);

function loop() {
  aqua.requestAnimFrame.call(null, loop);

  aqua.game.step();
}
loop();
}, 0);
});
})(this, this.load);

