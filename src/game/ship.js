(function(window, load) {
load.module('game/ship.js', load.script('game/bullet.js'), function() {

var ShipInput = aqua.type(aqua.Component,
  {
    init: function(inputMap) {
      var key;
      
      this.inputMap = inputMap;
      this.state = {};
      this.deccelState = 0;
       
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
    ship: true,
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
            [Math.cos(this.moveModel.angle) * 100,
            Math.sin(this.moveModel.angle) * 100]));
          bullet.add(btb.BulletRender.create());
          aqua.game.add(bullet);

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
      this.particle.ship = this;
      this.playing = false;
      this.decelState = 0;
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
      if (otherParticle.enemy){
        this.gameObject.destroy(this);
      }
      

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
        this.angle -= Math.PI * 0.04;
      }
      if (this.input.get('right')) {
        this.angle += Math.PI * 0.04;
      }
      if (this.input.get('up')) {
        this.particle.acceleration[0] = Math.cos(this.angle) * 100;
        this.particle.acceleration[1] = Math.sin(this.angle) * 100;
      }
      
      if (this.input.get('down') && (this.particle.velocity[0] !== 0 || this.particle.velocity[1] !== 0)) {
        if (this.decelState == 0) {
          var targetangle = (-this.particle.angle+(3*Math.PI/2))%(Math.PI*2);
          this.angle = this.angle%(Math.PI*2);
          if (Math.abs(this.angle - targetangle) < 0.01) {
            this.angle = targetangle;
            this.decelState = 1;
          }
          else if (this.angle > targetangle) {
            this.angle = this.angle - 0.2*(this.angle - targetangle);
          }
          else if (this.angle < targetangle) {
            this.angle = this.angle + 0.2*(targetangle - this.angle);
          }
        }
        else if (this.decelState == 1) {
          if (Math.abs(this.particle.velocity[0]) < 0.2 ){
            this.particle.velocity[0] = 0;
            this.particle.x = this.particle.lastPosition[0];
            this.particle.position[0] = this.particle.x;
          }
          if (Math.abs(this.particle.velocity[1]) < 0.2 ){
            this.particle.velocity[1] = 0;
            this.particle.y = this.particle.lastPosition[1];
            this.particle.position[1] = this.particle.y;
          }
          if ((Math.abs(this.particle.velocity[0]) >= 0.2) && Math.abs(this.particle.velocity[0]) >= 0.2) {
            this.particle.acceleration[0] = Math.cos(this.angle) * 100;
            this.particle.acceleration[1] = Math.sin(this.angle) * 100;
          }
        } 
      }
      else {
        this.decelState = 0;
      }
     
    }
  }
);

var ShipRender = aqua.type(aqua.Component,
  {
    onadd: function(gameObject) {
      this.ship = gameObject.get(ShipMove);
      if (!this.path) {
        this.pathAngle = 0;
        // this.path = new paper.Path.Rectangle(new paper.Rectangle(-17.5,-17.5,35,35));
        this.path = new paper.Path( [new paper.Point(90, -20), new paper.Point(20, 0), new paper.Point(90, 20)]);
        this.path.strokeColor = 'blue';
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
    83: 'down', // s
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
