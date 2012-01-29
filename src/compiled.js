(function(window, load) {
  var setTimeout = window.setTimeout,
      when = window.when,
      files = [
        'engine/init.js',
        'engine/math.js',
        'engine/base.js',
        'engine/object.js',
        'engine/paper_graphics.js',
        'engine/physics.js',
        'game/common.js',
        'game/bullet.js',
        'game/enemy.js',
        'game/level.js',
        'game/ship.js',
        'game/main.js'
      ],
      i;

  function resolve( promise, path ) {
    var script = load.get( path );
    if ( script.promise ) {
      script.promise.then( promise.resolve.bind( promise, script ) );
    } else {
      promise.resolve( script );
    }
  }

  files.forEach( function( path ) {
    var promise = when.defer();
    
    load.set( path, {} );
    load.promises[ path ] = promise;
    
    setTimeout( resolve.bind( null, promise, path ), 0);
  });
})(this, this.load);