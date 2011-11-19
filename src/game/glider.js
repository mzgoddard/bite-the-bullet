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
      this.state[this.input[e.keyCode]] = true;
    }
  }
);

var GliderMove = aqua.type(aqua.Component.prototype,
  {
    init: function() {
      this.x = 0;
      this.y = 0;
      
      this.vx = 0;
      this.vy = 0;
      
      this.ax = 0;
      this.ay = 0;
      
      this.angle = 0;
    },
    onadd: function(gameObject) {
      this.input = gameObject.get(GliderInput);
    },
    ondestroy: function() {
      this.input = null;
    },
    update: function() {
      
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
      }
      
      
    }
  }
);

glider.GliderInput = GliderInput;
glider.GliderMove = GliderMove;
glider.GliderRender = GliderRender;

glider.makeGlider = function(gameObject) {
  gameObject = gameObject || aqua.GameObject.create();
  
  gameObject.add(GliderInput.create());
  gameObject.add(GliderMove.create());
  gameObject.add(GliderRender.create());
  
  return gameObject;
};

});
})(this);