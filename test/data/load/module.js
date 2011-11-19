load.module('module.js', load.script('script.js'), function() {
  ok(true, 'dependencies loaded');
  start();
});