(function(window, aqua) {
  var Graphics = aqua.type(aqua.type.Base,
    {
      init: function(canvas) {
        this.canvas = canvas;
        this.drawCalls = aqua.PriorityList.create();
        this.shaders = {};
        
        this.deferred = when.defer();
        
        when(this.initContext(), this.deferred.resolve.bind(this.deferred));
      },
      initContext: function() {
        var deferred = when.defer();
        
        function initTestLoop() {
          this.gl = this.canvas.getContext('experimental-webgl');
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
    aqua.graphics.push(Graphics.create.apply(null, arguments);
  };

})(this, this.aqua);