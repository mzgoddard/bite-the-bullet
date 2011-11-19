(function(window) {
  var load = Object.create({
    init: function() {
      this.objects = {};
      this.promises = {};
      this.paths = {
        'script': 'src/',
        'data': 'data/'
      };
      
      return this;
    },
    get: function(path) {
      return this.objects[path];
    },
    fixPath: function(type, path) {
      return this.paths[type] + path;
    },
    script: function(path) {
      if (this.promises[path]) {
        return this.promises[path];
      }
      
      var script = window.document.createElement('script'),
          deferred = when.defer();

      this.objects[path] = script;
      this.promises[path] = deferred.promise;

      script.onload = function() {
        setTimeout(function() {
          if (script.promise) {
            script.promise.then(deferred.resolve.bind(script));
          } else {
            deferred.resolve(script);
          }
        }, 0);
      };

      script.src = this.fixPath('script', path);

      document.head.appendChild(script);

      return deferred.promise;
    },
    module: function(path, promise, callback) {
      this.objects[path].promise = promise;

      promise.then(callback);
    }
  }).init();
  
  window.load = load;
})(this);