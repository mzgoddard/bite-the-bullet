(function(window, load, aqua) {
  var setTimeout = window.setTimeout,
      when = window.when;
  
  var Graphics = aqua.type(aqua.type.Base.prototype,
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
        
        this.drawCalls.callAll(this, this.gl);
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
        this.shaders[options.name] = options;
        
        when.all([
          this.deferred.promise, 
          load.text(options.path + '.vs'),
          load.text(options.path + '.fs')
        ], this._buildProgram.bind(this, options));
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
        console.log(options.name, 'vertex');
        
        // fragment
        options.fragmentShader = shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, load.get(options.path + '.fs'));
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        console.log(options.name, 'fragment');
        
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

  aqua.graphics = [];
  aqua.initGraphics = function() {
    var graphics = Graphics.create.apply(null, arguments);
    aqua.graphics.push(graphics);
    
    return graphics;
  };

})(this, this.load, this.aqua);