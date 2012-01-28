(function(window, load) {
load.module('game/ship.js', load.script('game/bullet.js'), function() {

var ShipInput = aqua.type(aqua.Component,
  {
    init: function(inputMap) {
      var key;
      
      this.inputMap = inputMap;
      this.state = {};
      
      for ( key in inputMap ) {
        this.state[inputMap[key]] = {
          pressed: false
        };
      }
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
      return this.state[name].pressed;
    },
    getPressTime: function(name) {
      return this.state[name].pressed && Date.now() - this.state[name].start;
    },
    keydown: function(e) {
      console.log(e);
      var state = this.state[this.inputMap[e.keyCode]];
      if (!state) return;
      
      state.pressed = true;
      if (!state.start)
        state.start = Date.now();
    },
    keyup: function(e) {
      var state = this.state[this.inputMap[e.keyCode]];
      if (!state) return;
      
      state.pressed = false;
      delete state.start;
    }
  }
);

var ShipReset = aqua.type(aqua.Component, {
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
      this.game.add(glider.makeShip());
      this.game.destroy(this.gameObject);
    }
  }
});

var Ship = aqua.type(aqua.Component,
  {
    firedelay: 0.5,

    onadd: function(gameObject) {
      this.input = gameObject.get(ShipInput);
      this.moveModel = gameObject.get(ShipMove);
      this.firetimer = 0;
    },
    update: function() {
      if (this.input.get('fire')) {
        if (this.firetimer <= 0) {
          var bullet = aqua.GameObject.create();
          bullet.add(btb.Bullet.create(
            [this.moveModel.particle.position[0],this.moveModel.particle.position[1]], 
            [Math.cos(this.moveModel.angle) * 30 + this.moveModel.particle.velocity[0] / 0.05, Math.sin(this.moveModel.angle) * 30 + this.moveModel.particle.velocity[1] / 0.05]));
          bullet.add(btb.BulletRender.create());

          aqua.game.add(bullet);
          console.log(bullet);

          this.firetimer = this.firedelay;
        }
      }
      this.firetimer -= aqua.game.timing.delta;
    }
  }
);

var ShipMove = aqua.type(aqua.Component,
  {
    init: function() {
      this.x = 640 / 8 * 5;
      this.y = 480 / 8 * 3;

      this.vx = 0;
      this.vy = 0;

      this.ax = 0;
      this.ay = 0;

      this.angle = 0;

      this.radius = 25;
      
      this.score = 0;
      
      this.angle = 0;
      this.energy = 0;
      
      this.particle = aqua.Particle.create([this.x, this.y, 0], this.radius, 1);
      this.particle.isTrigger = true;
      this.particle.on('collision', this.oncollision.bind(this));
      
      this.playing = false;
    },
    onadd: function(gameObject) {
      this.input = gameObject.get(ShipInput);
    },
    ondestroy: function() {
      this.input = null;
    },
    ongameadd: function(gameObject, game) {
      game.world.addParticle(this.particle);
      
      this.world = game.world;
      this.sound = game.sound;
      
      this.x += game.world.box.left;
    },
    ongamedestroy: function(gameObject, game) {
      game.world.removeParticle(this.particle);
      
      if (game.score) {
        game.score.setMove(null);
      }
      
      if (aqua.game.sound) {
        aqua.game.sound.nodes.happy.source.gain.value = 1;
        aqua.game.sound.nodes.zone.source.gain.value = 0;
        aqua.game.sound.nodes.approach.source.gain.value = 0;
      }
    },
    oncollision: function(otherParticle, collision) {
      // console.log(otherParticle);
      this.energy += 1;
      // aqua.game.world.removeParticle(otherParticle);

      // if (!this.playing) return;
      // 
      // var delta = aqua.game.timing.fixedDelta,
      //     vx = otherParticle.lastPosition[0] - otherParticle.position[0],
      //     vy = otherParticle.lastPosition[1] - otherParticle.position[1],
      //     vl = Math.sqrt(vx*vx+vy*vy),
      //     va = Math.atan2(vy, vx);
      // 
      // if (isNaN(vx) || isNaN(vy)) {
      //   return;
      // }
      // 
      // while (va > Math.PI)
      //   va -= Math.PI * 2;
      // while (va < -Math.PI)
      //   va += Math.PI * 2;
      // 
      // var k = vl,
      //     n = k * 
      //       Math.cos(va + Math.PI - this.angle - Math.PI / 2) * 
      //       (Math.abs(va - this.angle) < Math.PI / 2 ? 1 : 0),
      //     nx = Math.cos(this.angle+Math.PI/2) * n,
      //     ny = Math.sin(this.angle+Math.PI/2) * n * 2;
      //     // console.log(nx, ny);
      // this.ax += Math.clamp(nx, -10, 1000);
      // this.ay += ny;
    },
    fixedUpdate: function() {
      if (this.input.get('left')) {
        this.angle -= Math.PI * 0.08;
      }
      if (this.input.get('right')) {
        this.angle += Math.PI * 0.08;
      }
      if (this.input.get('up')) {
        this.particle.acceleration[0] = Math.cos(this.angle) * 100;
        this.particle.acceleration[1] = Math.sin(this.angle) * 100;
      }

      // if (!this.playing && this.input.get('up')) {
      //   this.playing = true;
      // 
      //   // Playtomic.Log.Play();
      //   if (this.gameObject.game.score) {
      //     this.gameObject.game.score.setMove(this);
      //   }
      //   
      //   this.heatmapTime = Date.now();
      // } else if (!this.playing) {
      //   this.x = this.world.box.left + this.world.box.width / 8 * 5;
      //   return;
      // }
      // 
      // var delta = aqua.game.timing.fixedDelta,
      //     vl = Math.sqrt(this.vx*this.vx+this.vy*this.vy),
      //     va = Math.atan2(this.vy, this.vx);
      // 
      // while (va > Math.PI)
      //   va -= Math.PI * 2;
      // while (va < -Math.PI)
      //   va += Math.PI * 2;
      // 
      // this.ay -= 16;
      // 
      // var k = vl * 2,
      //     n = k * Math.cos(va + Math.PI - this.angle - Math.PI / 2) * (Math.abs(va - this.angle) < Math.PI / 2 ? 1 : 0),
      //     nx = Math.cos(this.angle+Math.PI/2) * n,
      //     ny = Math.sin(this.angle+Math.PI/2) * n;
      // 
      // this.ax += nx;
      // this.ay += ny;
      // 
      // if (this.input.get('up')) {
      //   this.angle += Math.PI * delta;
      //   
      //   if (this.x < this.world.box.left + this.world.box.width / 3) {
      //     this.ax += Math.cos(this.angle) * 50;
      //     this.ay += Math.sin(this.angle) * 50;
      //   }
      //   if (this.y < this.world.box.bottom + this.world.box.height / 8) {
      //     this.ax += Math.cos(this.angle) * 50;
      //     this.ay += Math.sin(this.angle) * 200;
      //   }
      // }
      // 
      // // integrate
      // this.vx += this.ax / 2 * delta;
      // this.x += this.vx * delta;
      // this.vx += this.ax / 2 * delta;
      // 
      // this.vy += this.ay / 2 * delta;
      // this.y += this.vy * delta;
      // this.vy += this.ay / 2 * delta;
      // 
      // vec3.set([this.x, this.y, 0], this.particle.position);
      // 
      // this.angle -= Math.PI * 0.2 * delta;
      // 
      // if (this.angle > Math.PI) {
      //   this.canScoreBackflip = true;
      // }
      // 
      // while (this.angle > Math.PI)
      //   this.angle -= Math.PI * 2;
      // while (this.angle < -Math.PI)
      //   this.angle += Math.PI * 2;
      // 
      // if (this.angle > -Math.PI / 4 && this.canScoreBackflip && aqua.game.score) {
      //   this.canScoreBackflip = false;
      //   aqua.game.score.addTrick('Backflip', 50000);
      // }
      // 
      // this.ax = 0;
      // this.ay = 0;
      // 
      // var fadeHappy = this.fadeHappy = Math.clamp((this.x - this.world.box.left - this.world.box.width / 2) / 40, 0, 1);
      // var fadeApproach = this.fadeApproach = Math.clamp((this.x - 240 + this.y / 8 - this.world.box.left) / (this.world.box.width / 6), 0, 1);
      // 
      // if (this.fadeApproach === 0) {
      //   this.inDanger = true;
      // }
      // 
      // if (this.fadeApproach == 1 && this.inDanger) {
      //   this.inDanger = false;
      //   
      //   if (aqua.game.score) {
      //     aqua.game.score.addTrick('Back for More', 50000);
      //   }
      // }
      // 
      // if (this.sound.nodes) {
      //   if (this.sound.nodes.happy)
      //     this.sound.nodes.happy.source.gain.value = Math.clamp(Math.lerp(0, 1, fadeHappy), 0, 1);
      //   if (this.sound.nodes.zone) {
      //     this.sound.nodes.zone.source.gain.value = Math.clamp(Math.lerp(0, 1, Math.lerp((1-fadeHappy), 0, 1-Math.sqrt(fadeApproach))), 0, 1);
      //   }
      //   if (this.sound.nodes.approach) {
      //     this.sound.nodes.approach.source.gain.value = Math.clamp(Math.lerp(1, 0, fadeApproach), 0, 1);
      //   }
      // }
      // 
      // if (this.world.box.contains([this.x, this.y])) {
      //   if (fadeApproach > 0) {
      //     this.score += fadeHappy * this.gameObject.game.timing.delta * 1000;
      //     this.score += (1 - fadeHappy) * this.gameObject.game.timing.delta * 10000;
      //   }
      // }
      // 
      // if (Date.now() - this.heatmapTime > 10000) {
      //   // Playtomic.Log.Heatmap('Position', '0001', this.x - this.world.box.left, this.y);
      //   this.heatmapTime = Date.now();
      // }
      // 
      // if (!(
      //   this.world.box.contains([this.x+this.radius,this.y+this.radius]) ||
      //   this.world.box.contains([this.x+this.radius,this.y-this.radius]) ||
      //   this.world.box.contains([this.x-this.radius,this.y+this.radius]) ||
      //   this.world.box.contains([this.x-this.radius,this.y-this.radius]))) {
      //   
      //   if (aqua.game.score) {
      //     if (this.world.box.bottom > this.y) {
      //       aqua.game.score.addTrick('The World is Flat', 10000);
      //     } else if (this.world.box.top < this.y) {
      //       aqua.game.score.addTrick('To The Sky', 200000);
      //     } else if (this.world.box.right < this.x) {
      //       aqua.game.score.addTrick('Exit Stage Right', 1000000);
      //     } else if (this.world.box.left > this.x) {
      //       aqua.game.score.addTrick('Exit Stage Left', 100000);
      //     }
      //   }
      //   
      //   // Playtomic.Log.Heatmap('Death', '0001', this.x - this.world.box.left, this.y);
      //   
      //   this.gameObject.game.destroy(this.gameObject);
      //   
      //   var resetObject = aqua.GameObject.create();
      //   resetObject.add(ShipReset.create(this.gameObject.get(ShipInput)));
      //   this.gameObject.game.add(resetObject);
      // }
    }
  }
);

var ShipRender = aqua.type(aqua.Component,
  {
    onadd: function(gameObject) {
      this.ship = gameObject.get(ShipMove);
      if (!this.path) {
        this.pathAngle = 0;
        this.path = new paper.Path.Rectangle(new paper.Rectangle(-17.5,-17.5,35,35));
        this.path.fillColor = 'blue';
      }
    },
    lateUpdate: function() {
      this.path.position.x = this.ship.particle.position[0];
      this.path.position.y = this.ship.particle.position[1];

      if (this.ship.angle != this.pathAngle) {
        this.path.rotate((this.ship.angle - this.pathAngle) / 2 / Math.PI * 360);
        this.pathAngle = this.ship.angle;
      }
    }
  }
);

glider.makeShip = function(gameObject) {
  gameObject = gameObject || aqua.GameObject.create();

  gameObject.add(ShipInput.create({
    87: 'up', // w
    65: 'left', // a
    68: 'right', // d
    38: 'up', // up arrow
    32: 'fire' // space
  }));
  gameObject.add(ShipMove.create());
  gameObject.add(Ship.create());
  gameObject.add(ShipRender.create());

  return gameObject;
};

});
})(this, this.load);
