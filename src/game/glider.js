(function(window, load) {
load.module('game/glider.js', null, function() {

var aqua = window.aqua,
    glider = window.glider;

function normalizeAngle(angle) {
  while (angle > Math.PI)
    angle -= Math.PI * 2;
  while (angle < Math.PI)
    angle += Math.PI * 2;

  return angle;
}

var GliderInput = aqua.type(aqua.Component,
  {
    init: function(inputMap) {
      this.inputMap = inputMap;
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
      this.state[this.inputMap[e.keyCode]] = true;
    },
    keyup: function(e) {
      this.state[this.inputMap[e.keyCode]] = false;
    }
  }
);

var GliderMove = aqua.type(aqua.Component,
  {
    init: function() {
      this.x = 640 / 8 * 5;
      this.y = 480 / 2;

      this.vx = 0;
      this.vy = 0;

      this.ax = 0;
      this.ay = 0;

      this.angle = 0;

      this.radius = 25;
      
      this.score = 0;
      
      this.particle = aqua.Particle.create([this.x, this.y, 0], this.radius, 1);
      this.particle.isTrigger = true;
      this.particle.on('collision', this.oncollision.bind(this));
      
      this.playing = false;
    },
    onadd: function(gameObject) {
      this.input = gameObject.get(GliderInput);
    },
    ondestroy: function() {
      this.input = null;
    },
    ongameadd: function(gameObject, game) {
      game.world.addParticle(this.particle);
      
      this.world = game.world;
      this.sound = game.sound;
      
      this.x += game.world.box.left;
      
      if (game.score) {
        game.score.setMove(this);
      }
    },
    ongamedestroy: function(gameObject, game) {
      game.world.removeParticle(this.particle);
      
      if (game.score) {
        game.score.setMove(null);
      }
    },
    oncollision: function(otherParticle, collision) {
      if (!this.playing) return;
      
      var delta = aqua.game.timing.fixedDelta,
          vx = otherParticle.lastPosition[0] - otherParticle.position[0],
          vy = otherParticle.lastPosition[1] - otherParticle.position[1],
          vl = Math.sqrt(vx*vx+vy*vy),
          va = Math.atan2(vy, vx);
      
      if (isNaN(vx) || isNaN(vy)) {
        return;
      }

      while (va > Math.PI)
        va -= Math.PI * 2;
      while (va < -Math.PI)
        va += Math.PI * 2;

      var k = vl * 1,
          n = k * 
            Math.cos(va + Math.PI - this.angle - Math.PI / 2) * 
            (Math.abs(va - this.angle) < Math.PI / 2 ? 1 : 0),
          nx = Math.cos(this.angle+Math.PI/2) * n,
          ny = Math.sin(this.angle+Math.PI/2) * n;
          // console.log(nx, ny);
      this.ax += nx;
      this.ay += ny;
    },
    fixedUpdate: function() {
      if (!this.playing && this.input.get('up')) {
        this.playing = true;
      } else if (!this.playing) {
        this.x = this.world.box.left + this.world.box.width / 8 * 5;
        return;
      }
      
      var delta = aqua.game.timing.fixedDelta,
          vl = Math.sqrt(this.vx*this.vx+this.vy*this.vy),
          va = Math.atan2(this.vy, this.vx);

      while (va > Math.PI)
        va -= Math.PI * 2;
      while (va < -Math.PI)
        va += Math.PI * 2;

      this.ay -= 32;

      var k = vl * 2,
          n = k * Math.cos(va + Math.PI - this.angle - Math.PI / 2) * (Math.abs(va - this.angle) < Math.PI / 2 ? 1 : 0),
          nx = Math.cos(this.angle+Math.PI/2) * n,
          ny = Math.sin(this.angle+Math.PI/2) * n;

      this.ax += nx;
      this.ay += ny;

      // integrate
      this.vx += this.ax / 2 * delta;
      this.x += this.vx * delta;
      this.vx += this.ax / 2 * delta;

      this.vy += this.ay / 2 * delta;
      this.y += this.vy * delta;
      this.vy += this.ay / 2 * delta;
      
      vec3.set([this.x, this.y, 0], this.particle.position);

      // if (this.input.get('down')) {
      //   this.angle -= Math.PI * delta;
      // }
      if (this.input.get('up')) {
        this.angle += Math.PI * delta;
      }
      
      this.angle -= Math.PI * 0.2 * delta;
      
      if (this.angle > Math.PI) {
        this.canScoreBackflip = true;
      }
      
      while (this.angle > Math.PI)
        this.angle -= Math.PI * 2;
      while (this.angle < -Math.PI)
        this.angle += Math.PI * 2;

      if (this.angle > -Math.PI / 4 && this.canScoreBackflip && aqua.game.score) {
        this.canScoreBackflip = false;
        aqua.game.score.addTrick('Backflip', 200000);
      }

      this.ax = 0;
      this.ay = 0;
      
      var fadeHappy = this.fadeHappy = Math.clamp((this.x - this.world.box.left - this.world.box.width / 2) / 40, 0, 1);
      var fadeApproach = this.fadeApproach = Math.clamp((this.x - 240 + this.y / 8 - this.world.box.left) / (this.world.box.width / 6), 0, 1);
      
      if (this.fadeApproach == 0) {
        this.inDanger = true;
      }
      
      if (this.fadeApproach == 1 && this.inDanger) {
        this.inDanger = false;
        
        if (aqua.game.score) {
          aqua.game.score.addTrick('Back for More', 500000);
        }
      }
      
      if (this.sound.nodes) {
        if (this.sound.nodes.happy)
          this.sound.nodes.happy.source.gain.value = Math.clamp(Math.lerp(0, 1, fadeHappy), 0, 1);
        if (this.sound.nodes.zone) {
          this.sound.nodes.zone.source.gain.value = Math.clamp(Math.lerp(1, 0, fadeHappy), 0, 1);
        }
        if (this.sound.nodes.approach) {
          this.sound.nodes.approach.source.gain.value = Math.clamp(Math.lerp(1, 0, fadeApproach), 0, 1);
        }
      }
      
      if (this.world.box.contains([this.x, this.y])) {
        if (fadeApproach > 0) {
          this.score += fadeHappy * this.gameObject.game.timing.delta * 1000;
          this.score += (1 - fadeHappy) * this.gameObject.game.timing.delta * 10000;
        }
      }
      
      // window.Sizzle('#score')[0].innerText = parseInt(this.score);
      
      if (!(
        this.world.box.contains([this.x+this.radius,this.y+this.radius]) ||
        this.world.box.contains([this.x+this.radius,this.y-this.radius]) ||
        this.world.box.contains([this.x-this.radius,this.y+this.radius]) ||
        this.world.box.contains([this.x-this.radius,this.y-this.radius]))) {
        
        if (aqua.game.score) {
          if (this.world.box.bottom > this.y) {
            aqua.game.score.addTrick('The World is Flat', 10000);
          } else if (this.world.box.top < this.y) {
            aqua.game.score.addTrick('To The Sky', 200000);
          } else if (this.world.box.right < this.x) {
            aqua.game.score.addTrick('Exit Stage Right', 1000000);
          } else if (this.world.box.left > this.x) {
            aqua.game.score.addTrick('Exit Stage Left', 100000);
          }
        }
        
        this.gameObject.game.destroy(this.gameObject);
        
        var resetObject = aqua.GameObject.create();
        resetObject.add(GliderReset.create(this.gameObject.get(GliderInput)));
        this.gameObject.game.add(resetObject);
      }
    }
  }
);

var GliderScore = aqua.type(aqua.Component,
  {
    init: function() {
      this.score = 0;

      this.zoneTime = 0;
      this.zoneDiv = null;

      this.tricks = [];
      
      when(load.text('locale/en/tricks.json'), (function(text) {
        this.titles = JSON.parse(text);
      }).bind(this));
    },
    setMove: function(move) {
      this.move = move;
      
      if (move)
        this._clear();
    },
    _clear: function() {
      var tricks = this.tricks,
          count = tricks.length,
          i;
      
      for ( i = 0; i < count; i++ ) {
        this.removeTrick(tricks[i]);
      }

      this.score = 0;
      this.zoneTime = 0;
      this.zoneTimeAwarded = 0;
      this.zoneDiv = null;
    },
    getLocale: function(name) {
      if (this.titles && this.titles[name]) {
        name = this.titles[name][parseInt(Math.random() * this.titles[name].length - 1)];
      }
      return name;
    },
    addTrick: function(name, points, time) {
      if (time == null) time = 2;
      
      this.score += points;
      
      if (this.titles && this.titles[name]) {
        name = this.titles[name][parseInt(Math.random() * this.titles[name].length - 1)];
      }
      
      name = name.replace(/ /g, '&nbsp;');
      
      var trick = $(
        '<div class="trick" style="top:' + (32 + this.tricks.length * 14) + 'px;"><div class="value">'+
          points+
        '</div><div class="name">'+
          name+
        '</div></div>').appendTo(this.stuntDiv),
          name = trick.find('.name');
      trick.time = time;
      trick.points = points;
      
      name.css('right', -name.width() - 5);

      this.tricks.push(trick);
    },
    removeTrick: function(trickDiv) {
      if (!trickDiv.removing) {
        trickDiv.removing = true;
        
        trickDiv.css('opacity', 0);
        setTimeout((function(trickDiv) {
          trickDiv.remove();

          var index = this.tricks.indexOf(trickDiv);
          if (index != -1) {
            this.tricks.splice(index, 1);
          }
        }).bind(this, trickDiv), 500);
      }
    },
    ongameadd: function(gameObject, game) {
      this.world = game.world;
    },
    ongamedestroy: function() {
      delete this.tricks;
    },
    fixedUpdate: function() {
      var delta = this.gameObject.game.timing.fixedDelta;
      var stuntDiv = this.stuntDiv,
          scoreDiv = $('#score'),
          zoneDiv = this.zoneDiv;
      
      if (!stuntDiv) {
        stuntDiv = this.stuntDiv = $('#stunts');
      }
      
      if (this.move && this.world.box.contains([this.move.x, this.move.y])) {
        if (this.move.fadeApproach > 0) {
          this.score += this.move.fadeHappy * delta * 1000;
          this.score += (1 - this.move.fadeHappy) * delta * 10000;
        
          // in the zone
          if (this.move.fadeHappy == 0) {
            this.zoneTime += delta;
            
            if (this.zoneTime - this.zoneTimeAwarded > 5) {
              this.zoneTimeAwarded += 5;
              
              this.addTrick(this.zoneTimeAwarded + 's ' + this.getLocale('in the Zone'), this.zoneTimeAwarded * 10000);
            }
          } else {
            if (this.zoneTime) {
              this.zoneTime = parseInt(this.zoneTime * 10) / 10;
              this.addTrick(this.zoneTime + 's ' + this.getLocale('in the Zone'), this.zoneTime * 10000);
            }
            
            this.zoneTime = 0;
            this.zoneTimeAwarded = 0;
          }
        } else {
          if (this.zoneTime) {
            this.zoneTime = parseInt(this.zoneTime * 10) / 10;
            this.addTrick(this.zoneTime + 's ' + this.getLocale('in the Zone'), this.zoneTime * 10000);
          }
          
          this.zoneTime = 0;
          this.zoneTimeAwarded = 0;
        }
      
        if (this.zoneTime > 0 && !this.zoneDiv) {
          zoneDiv = this.zoneDiv = $('<div class="trick zone">0s</div>').appendTo(stuntDiv);

          this.tricks.splice(0, 0, zoneDiv);
        }
        if (this.zoneTime == 0 && this.zoneDiv) {
          delete this.zoneDiv;

          zoneDiv.time = 2;
          
          zoneDiv = null;
        }
      } else {
        if (this.zoneDiv) {
          delete this.zoneDiv;
          
          zoneDiv.time = 0;
          
          zoneDiv = null;
        }
      }
      
      if (zoneDiv) {
        zoneDiv.text(parseInt(this.zoneTime * 10) / 10 + 's');
      }
      
      for ( var i = 0; i < this.tricks.length; i++ ) {
        var trickDiv = this.tricks[i];
        trickDiv.css('top', 32 + i * 14);

        if (trickDiv.time != null) {
          trickDiv.time -= delta;
          if (trickDiv.time <= 0) {
            this.removeTrick(trickDiv);
          }
        }
      }

      scoreDiv.text(parseInt(this.score));
      stuntDiv.css('left', (window.innerWidth - scoreDiv.width()) / 2);
    }
  }
);

var GliderRender = aqua.type(aqua.Component,
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
      
      gl.disable(gl.BLEND);
      
      graphics.useShader('basic');
      
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
      
      floatView[8] = floatView[4] + Math.cos(angle - Math.PI / 4 * 3) * radius / 3 * 2 * Math.lerp(0.7, 1, Math.random());
      floatView[9] = floatView[5] + Math.sin(angle - Math.PI / 4 * 3) * radius / 3 * 2 * Math.lerp(0.7, 1, Math.random());
      
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

var GliderReset = aqua.type(aqua.Component, {
  init: function(map) {
    this.inputMap = map.inputMap || map;
  },
  ongameadd: function(gameObject, game) {
    this._keydown = this.keydown.bind(this);
    window.addEventListener('keydown', this._keydown);
    this.game = game;
  },
  keydown: function(e) {
    if (this.inputMap[e.keyCode] == 'up') {
      window.removeEventListener('keydown', this._keydown);
      this.game.add(glider.makeGlider());
      this.game.destroy(this.gameObject);
    }
  }
});

glider.GliderScore = GliderScore;
glider.GliderReset = GliderReset;

glider.GliderInput = GliderInput;
glider.GliderMove = GliderMove;
glider.GliderRender = GliderRender;

glider.makeGlider = function(gameObject) {
  gameObject = gameObject || aqua.GameObject.create();

  gameObject.add(GliderInput.create({
    87: 'up', // w
    38: 'up', // up arrow
    32: 'up' // space
  }));
  gameObject.add(GliderMove.create());
  gameObject.add(GliderRender.create());

  return gameObject;
};

});
})(this, this.load);