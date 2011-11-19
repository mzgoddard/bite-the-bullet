(function(window) {
  var document = window.document,
      XMLHttpRequest = window.XMLHttpRequest,
      setTimeout = window.setTimeout,
      when = window.when,
      Sizzle = window.Sizzle;
  
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
            console.log('wait');
            script.promise.then(deferred.resolve.bind(deferred, script));
          } else {  
            console.log(path);
            deferred.resolve(script);
          }
        }, 0);
      };

      script.src = this.fixPath('script', path);

      document.head.appendChild(script);

      return deferred.promise;
    },
    module: function(path, promise, callback) {
      if (!this.objects[path]) {
        this.objects[path] = Sizzle('script[src="'+this.fixPath('script',path)+'"]')[0];
      }
      if (promise) {
        this.objects[path].promise = promise;

        promise.then(function(){console.log(path)}).then(callback);
      } else {
        callback();
      }
    },
    text: function(path) {
      if (this.promises[path]) {
        return this.promises[path];
      }

      var xhr = new XMLHttpRequest(),
          deferred = when.defer();

      this.promises[path] = deferred.promise;

      xhr.onload = (function() {
        this.objects[path] = xhr.responseText;
        deferred.resolve(xhr.responseText);
      }).bind(this);
      xhr.onerror = function() {
        deferred.reject();
      };
      
      // xhr.responseType = 'text';
      xhr.open('GET', this.fixPath('data', path));
      xhr.send();
      
      return deferred.promise;
    }
  }).init();
  
  window.load = load;
})(this);