(function(window, load) {
load.module('game/glider.js', null, function() {

var aqua = window.aqua,
    glider = window.glider;

var GliderInput = aqua.type(aqua.Component.prototype,
  {
    init: function(input) {
      this.input = input;
      this.state = {};
    },
    onadd: function() {
      window.addEventListener('keydown', this._keydown = this.keydown.bind(this));
      window.addEventListener('keyup', this._keyup = this.keyup.bind(this));
    },
    ondestroy: function() {
      window.removeEventListener('keydown', this._keydown);
      window.removeEventListener('keyup', this._keyup);
    },
    get: function(name) {
      return this.state[name];
    },
    keydown: function(e) {
      this.state[this.input[e.keyCode]] = true;
    },
    keyup: function(e) {
      this.state[this.input[e.keyCode]] = false;
    }
  }
);

var GliderMove = aqua.type(aqua.Component.prototype,
  {
    init: function() {
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight / 2;
      
      this.vx = 0;
      this.vy = 0;
      
      this.ax = 0;
      this.ay = 0;
      
      this.angle = 0;
      
      this.radius = 25;
    },
    onadd: function(gameObject) {
      this.input = gameObject.get(GliderInput);
    },
    ondestroy: function() {
      this.input = null;
    },
    update: function() {
      var delta = aqua.game.timing.delta,
          vl = Math.sqrt(this.vx*this.vx+this.vy*this.vy),
          va = Math.atan2(this.vy, this.vx);

      while (va > Math.PI)
        va -= Math.PI * 2;
      while (va < Math.PI)
        va += Math.PI * 2;

      this.ay -= 32;
      
      var k = vl * 10,
          n = k * Math.cos(va + Math.PI - this.angle - Math.PI / 2) * (Math.abs(va - this.angle) < Math.PI / 2 ? 1 : 0),
          nx = Math.cos(this.angle+Math.PI/2) * n,
          ny = Math.sin(this.angle+Math.PI/2) * n;

      // this.ax += Math.sin(this.angle) * this.vx;
      this.ax += nx;
      this.ay += ny;

      // integrate
      this.vx += this.ax / 2 * delta;
      this.x += this.vx * delta;
      this.vx += this.ax / 2 * delta;

      this.vy += this.ay / 2 * delta;
      this.y += this.vy * delta;
      this.vy += this.ay / 2 * delta;

      if (this.input.get('down')) {
        this.angle -= Math.PI * delta;
      }
      if (this.input.get('up')) {
        this.angle += Math.PI * delta;
      }
      
      while (this.angle > Math.PI)
        this.angle -= Math.PI * 2;
      while (this.angle < Math.PI)
        this.angle += Math.PI * 2;

      this.ax = 0;
      this.ay = 0;
    }
  }
);

var GliderRender = aqua.type(aqua.Component.prototype,
  {
    onadd: function(gameObject) {
      this.move = gameObject.get(GliderMove);
    },
    ongameadd: function(gameObject, game) {
      this.drawCall = aqua.PriorityItem.create(this.draw.bind(this));
      game.graphics.addDrawCall(this.drawCall);
    },
    ongamedestroy: function(gameObject, game) {
      game.graphics.removeDrawCall(this.drawCall);
    },
    draw: function(graphics, gl) {
      if (!this.buffer) {
        this.buffer = gl.createBuffer();
        this.arrayBuffer = new ArrayBuffer(4 * 4 * 3);
        this.floatView = new Float32Array(this.arrayBuffer);
      }
      
      var floatView = this.floatView,
          angle = this.move.angle,
          x = this.move.x,
          y = this.move.y,
          radius = this.move.radius,
          shader = graphics.shaders.basic;
      
      if (!shader.matrixLocation) {
        shader.matrixLocation = gl.getUniformLocation(shader.program, 'modelview_projection');
        shader.texture0Location = gl.getUniformLocation(shader.program, 'texture0');
        shader.colorLocation = gl.getUniformLocation(shader.program, 'color');
        
        shader.positionLocation = gl.getAttribLocation(shader.program, 'a_position');
        shader.texcoord0Location = gl.getAttribLocation(shader.program, 'a_texcoord0');
        
        gl.enableVertexAttribArray(shader.positionLocation);
        gl.enableVertexAttribArray(shader.texcoord0Location);
      }
      
      floatView[0] = x + Math.cos(angle) * radius;
      floatView[1] = y + Math.sin(angle) * radius;
      
      floatView[4] = x + Math.cos(angle + Math.PI) * radius;
      floatView[5] = y + Math.sin(angle + Math.PI) * radius;
      
      floatView[8] = x + Math.cos(angle + Math.PI / 4 * 5) * radius;
      floatView[9] = y + Math.sin(angle + Math.PI / 4 * 5) * radius;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, floatView, gl.DYNAMIC_DRAW);
      
      gl.uniformMatrix4fv(shader.matrixLocation, false, graphics.projection);
      gl.uniform4f(shader.colorLocation, 255 / 255, 90 / 255, 48 / 255, 255 / 255);
      gl.uniform1i(shader.texture0Location, 0);
      
      gl.vertexAttribPointer(shader.positionLocation, 2, gl.FLOAT, false, 4 * 4, 0);
      gl.vertexAttribPointer(shader.texcoord0Location, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
      
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
);

glider.GliderInput = GliderInput;
glider.GliderMove = GliderMove;
glider.GliderRender = GliderRender;

glider.makeGlider = function(gameObject) {
  gameObject = gameObject || aqua.GameObject.create();

  gameObject.add(GliderInput.create({
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  }));
  gameObject.add(GliderMove.create());
  gameObject.add(GliderRender.create());

  return gameObject;
};

});
})(this, this.load);