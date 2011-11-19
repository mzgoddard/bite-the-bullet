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

asyncTest('load module', 1, function() {
  load.paths.script = 'data/load/';
  
  load.script('module.js');
});

asyncTest('load text', 1, function() {
  load.paths.data = 'data/load/';
  
  load.text('text.txt').then(function(text) {
    equals(text, 'some text');
    start();
  }, function() {
    start();
  });
});

})(window);