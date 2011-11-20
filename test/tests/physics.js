(function(window) {

module('aqua.physics');

test('physics objects exist', function() {
  ok(aqua.Box);
  ok(aqua.Particle);
  ok(aqua.World);
});

})(this);