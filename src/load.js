(function(window) {
  var document = window.document,
      XMLHttpRequest = window.XMLHttpRequest,
      setTimeout = window.setTimeout,
      when = window.when,
      $ = window.$;

  function _chain( deferred, promise, callbacks ) {
    var defer2,
        slice = Array.prototype.slice;
    
    if ( callbacks.length > 0 ) {
      when( promise, function() {
        var promise = callbacks[0]();
        _chain( deferred, promise, slice.call( callbacks, 1 ) );
      } );
    } else {
      when.chain( promise, deferred );
    }
  }
  
  var load = Object.create({
    init: function() {
      this.objects = {};
      this.promises = {};
      this.loadedAs = {};
      this.paths = {
        'script': 'src/',
        'data': 'data/'
      };
      
      return this;
    },
    set: function(path, content) {
      this.objects[path] = content;
    },
    get: function(path) {
      return this.objects[path];
    },
    type: function(path) {
      if (typeof(path) == 'string') {
        return this.loadedAs[path];
      } else {
        return path.type;
      }
    },
    fixPath: function(type, path) {
      return this.paths[type] + path;
    },
    guessType: function(path) {
      if (/\.(png|jpg|jpeg$)/i.test(path)) {
        return 'image';
      } else if (/\.txt$/i.test(path)) {
        return 'text';
      } else if (/\.json$/i.test(path)) {
        return 'json';
      }
      return 'data';
    },
    chain: function(promise, callback) {
      var deferred = when.defer();

      // when(promise,
      //   function() {
      //     when.chain(callback(), deferred);
      //   });
      _chain( deferred, promise, Array.prototype.slice.call( arguments, 1 ) );


      return deferred;
    },
    script: function(path) {
      var script, deferred;
      
      if (this.promises[path]) {
        return this.promises[path];
      }
      
      // use old script if it was loaded old school
      if (!this.objects[path]) {
        script = $('script[src="'+this.fixPath('script',path)+'"]')[0];
        if (script) {
          deferred = when.defer();
          deferred.resolve();
          
          this.objects[path] = script;
          this.promises[path] = deferred.promise;
          
          return this.promises[path];
        }
      }
      
      script = window.document.createElement('script');
      deferred = when.defer();

      this.objects[path] = script;
      this.promises[path] = deferred.promise;

      script.onload = function() {
        setTimeout(function() {
          if (script.promise) {
            script.promise.then(deferred.resolve.bind(deferred, script));
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
      if (!this.objects[path]) {
        this.objects[path] = $('script[src="'+this.fixPath('script',path)+'"]')[0];
      }
      if (promise) {
        this.objects[path].promise = promise;

        promise.then(callback);
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

      this.loadedAs[path] = 'text';
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
    },
    data: function(path) {
      if (this.promises[path]) {
        return this.promises[path];
      }

      var xhr = new XMLHttpRequest(),
          deferred = when.defer();

      this.loadedAs[path] = 'data';
      this.promises[path] = deferred.promise;

      xhr.onload = (function() {
        this.objects[path] = xhr.response;
        deferred.resolve(xhr.response);
      }).bind(this);
      xhr.onerror = function() {
        deferred.reject();
      };
      
      xhr.open('GET', this.fixPath('data', path));
      xhr.responseType = 'arraybuffer';
      xhr.send();
      
      return deferred.promise;
    },
    json: function(path) {
      if (this.promises[path]) {
        return this.promises[path];
      }

      var xhr = new XMLHttpRequest(),
          deferred = when.defer();

      this.loadedAs[path] = 'json';
      this.promises[path] = deferred.promise;

      xhr.onload = (function() {
        try {
          this.objects[path] = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error('failed to parse ' + path)
          console.error(e.toString());
        }
        deferred.resolve(xhr.responseText);
      }).bind(this);
      xhr.onerror = function() {
        deferred.reject();
      };

      // xhr.responseType = 'text';
      xhr.open('GET', this.fixPath('data', path));
      // xhr.responseType = 'json';
      xhr.send();

      return deferred.promise;
    },
    image: function(path) {
      if (this.promises[path]) {
        return this.promises[path];
      }

      var img = new Image(),
          deferred = when.defer();

      this.loadedAs[path] = 'image';
      this.promises[path] = deferred.promise;

      img.onload = (function() {
        this.objects[path] = img;
        deferred.resolve(img);
      }).bind(this);
      img.onerror = function() {
        deferred.reject();
      };

      img.src = this.fixPath('data', path);

      return deferred.promise;
    },
    load: function(filepath) {
      if (typeof(filepath) == 'string') {
        return this[this.guessType(filepath)](filepath);
      } else {
        return this[filepath.type](filepath.path);
      }
    },
    package: function(path) {
      if (this.promises[path]) {
        return this.promises[path];
      }

      var defer = when.defer(),
          waiting = 0,
          jsonRE = /^{/,
          def;

      function recurse(files) {
        if (!files) return;

        var i;
        waiting += files.length;
        for (i = 0; i < files.length; i++) {
          load.load(files[i])
            .then((function(filepath){
              console.log(filepath, load.type(filepath));
              if (load.type(filepath) == "json") {
                recurse(load.get(filepath).files);
              }

              waiting--;
              if (waiting == 0) {
                defer.resolve();
              }
            }).bind(this, files[i]));
        }
      }

      if (typeof(path) == "object") {
        recurse(path.files);

        if (waiting == 0) {
          defer.resolve();
        }
      } else if (jsonRE.test(path.trim())) {
        def = JSON.parse(path);
        recurse(def.files);

        if (waiting == 0) {
          defer.resolve();
        }
      } else {
        load.json(path).then(function() {
          recurse(load.get(path).files);

          if (waiting == 0) {
            defer.resolve();
          }
        });
      }

      this.promises[path] = defer.promise;
      return defer.promise;
    },
    definition: function(json) {
      function recurse(object, json) {
        if (json.file) {
          recurse(object, load.get(json.file));
        }
        return jQuery.extend(true, object, json);
      }
      return recurse({}, json);
    }
  }).init();
  
  window.load = load;
})(this);