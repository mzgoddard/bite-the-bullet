(function(window) {

test('load exists and has methods', 4, function() {
  ok(load);
  ok(load.get);
  ok(load.script);
  ok(load.module);
});

asyncTest('load script', 1, function() {
  load.paths.script = 'data/load/';
  
  load.script('script.js');
});

})(window);