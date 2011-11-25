(function(window, load, aqua) {
load.module('engine/graphics.js',
  load.script('engine/object.js'),
function(){
  var setTimeout = window.setTimeout,
      when = window.when,
      mat4 = window.mat4;
  
  var Graphics = aqua.type(aqua.type.Base,
    {
      init: function(canvas) {
        this.canvas = canvas;
        this.drawCalls = aqua.PriorityList.create();
        this.shaders = {};
        
        this.deferred = when.defer();
        
        this.projection = mat4.identity(mat4.create());
        this.modelview = mat4.identity(mat4.create());
        this.matrix = mat4.create();
        
        when(this.initContext(), this.deferred.resolve.bind(this.deferred));
        
        when(this.deferred, (function() {
          this.last = Date.now();
          this.sinceLast = 0;
        }).bind(this));
        
      },
      initContext: function() {
        var deferred = when.defer();
        
        function initTestLoop() {
          this.gl = this.canvas.getContext('experimental-webgl', {
            antialias: true
          });
          if (!this.gl) {
            setTimeout(initTestLoop.bind(this), 0);
          } else {
            deferred.resolve(this);
          }
        }
        initTestLoop.call(this);
        
        return deferred.promise;
      },
      draw: function() {
        if (!this.gl) return;
        
        var now = Date.now();
        this.sinceLast += (now - this.last) / 1000;
        this.last = now;
        
        if (this.sinceLast >= 1 / 20) {
          this.drawCalls.callAll(this, this.gl);
        }
        
        while (this.sinceLast >= 1 / 20) {
          this.sinceLast -= 1 / 20;
        }
      },
      addDrawCall: function(drawCall) {
        this.drawCalls.add(drawCall);
        return this;
      },
      removeDrawCall: function(drawCall) {
        this.drawCalls.remove(drawCall);
        return this;
      },
      addShader: function(options) {
        if (this.shaders[options.name])
          return this.shaders[options.name].promise;
        
        var deferred = when.defer();
        this.shaders[options.name] = options;
        options.promise = deferred.promise;
        
        when.chain(when.all([
          this.deferred.promise, 
          load.text(options.path + '.vs'),
          load.text(options.path + '.fs')
        ], this._buildProgram.bind(this, options)), deferred);
        
        return options.promise;
      },
      _buildProgram: function(options) {
        var gl = this.gl,
            program = options.program = gl.createProgram(),
            shader;
        
        // vertex
        options.vertexShader = shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, load.get(options.path + '.vs'));
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        
        // fragment
        options.fragmentShader = shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, load.get(options.path + '.fs'));
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        
        gl.linkProgram(program);
      },
      useShader: function(name) {
        this.gl.useProgram(this.shaders[name].program);
      },
      addTexture: function(path) {
        
      },
      useTexture: function(path, num) {
        num = num || 0;
        
        
      }
    }
  );

  var Renderer = aqua.type(aqua.Component,
    {
      ongameadd: function(gameObject, game) {
        this.drawCall = aqua.PriorityItem.create(this.draw.bind(this));
        game.graphics.addDrawCall(this.drawCall);
      },
      ongamedestroy: function(gameObject, game) {
        game.graphics.removeDrawCall(this.drawCall);
      },
      draw: function(graphics, gl) {}
    }
  );

  aqua.graphics = [];
  aqua.initGraphics = function() {
    var graphics = Graphics.create.apply(null, arguments);
    aqua.graphics.push(graphics);
    
    return graphics;
  };
  aqua.Renderer = Renderer;

});
})(this, this.load, this.aqua);