(function(window, load) {
load.module('game/ship.js', when.all([load.script('game/bullet.js'), load.package('ship/ship.json')]), function() {

var ShipInput = aqua.type(aqua.Component,
  {
    init: function(def) {
      var key;
      
      this.inputMap = def.map;
      this.state = {};
      this.deccelState = 0;
      
      for ( key in def.map ) {
        this.state[def.map[key]] = {
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
      // console.log(e);
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
    init: function(def) {
      this.def = def;
    },
    onadd: function(gameObject) {
      this.input = gameObject.get(ShipInput);
      this.moveModel = gameObject.get(ShipMove);
      this.firetimer = 0;
    },
    update: function() {
      if (this.input.get('fire')) {
        if (this.firetimer <= 0 && this.moveModel.energy >= 10) {
          var speed = this.def.bullet.speed || 100,
              bullet = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0]+Math.cos(this.moveModel.angle)*this.moveModel.radius,
                   this.moveModel.particle.position[1]+Math.sin(this.moveModel.angle)*this.moveModel.radius],
                velocity:
                  [Math.cos(this.moveModel.angle) * speed,
                   Math.sin(this.moveModel.angle) * speed]
              }}));

          aqua.game.add(bullet);
          this.moveModel.energy -= 10;
          $('#energy').css('width',this.moveModel.energy+"%");
          this.firetimer = this.firedelay;
        }
      }
      else if (this.input.get('fire2')) {
        if (this.firetimer <= 0 && this.moveModel.energy >= 30) {
          var speed = this.def.bulletSpeed || 100,
              bullet = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [Math.cos(this.moveModel.angle) * speed,
                   Math.sin(this.moveModel.angle) * speed]
              }})),
              bullet2 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [Math.cos(this.moveModel.angle+Math.PI/8) * speed,
                   Math.sin(this.moveModel.angle+Math.PI/8) * speed]
              }})),
              bullet3 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [Math.cos(this.moveModel.angle-Math.PI/8) * speed,
                   Math.sin(this.moveModel.angle-Math.PI/8) * speed]
              }}));
    
          aqua.game.add(bullet);
          aqua.game.add(bullet2);
          aqua.game.add(bullet3);
          this.moveModel.energy -= 30;
          $('#energy').css('width',this.moveModel.energy+"%");
          this.firetimer = this.firedelay;
        }
      }
      else if (this.input.get('fire3')) {
        if (this.firetimer <= 0 && this.moveModel.energy >= 30) {
          var speed = this.def.bulletSpeed || 100,
              bullet = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [Math.cos(this.moveModel.angle) * speed,
                   Math.sin(this.moveModel.angle) * speed]
              }})),
              bullet2 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [-Math.cos(this.moveModel.angle) * speed,
                   -Math.sin(this.moveModel.angle) * speed]
              }})),
              bullet3 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [Math.cos(this.moveModel.angle+2*Math.PI/8) * speed,
                   Math.sin(this.moveModel.angle+2*Math.PI/8) * speed]
              }})),
              bullet4 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [-Math.cos(this.moveModel.angle+2*Math.PI/8) * speed,
                   -Math.sin(this.moveModel.angle+2*Math.PI/8) * speed]
              }})),
              bullet5 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [Math.cos(this.moveModel.angle+4*Math.PI/8) * speed,
                   Math.sin(this.moveModel.angle+4*Math.PI/8) * speed]
              }})),
              bullet6 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [-Math.cos(this.moveModel.angle+4*Math.PI/8) * speed,
                   -Math.sin(this.moveModel.angle+4*Math.PI/8) * speed]
              }})),
              bullet7 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [Math.cos(this.moveModel.angle+6*Math.PI/8) * speed,
                   Math.sin(this.moveModel.angle+6*Math.PI/8) * speed]
              }})),
              bullet8 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
                position:
                  [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
                velocity:
                  [-Math.cos(this.moveModel.angle+6*Math.PI/8) * speed,
                   -Math.sin(this.moveModel.angle+6*Math.PI/8) * speed]
              }}));
    
          aqua.game.add(bullet);
          aqua.game.add(bullet2);
          aqua.game.add(bullet3);
          aqua.game.add(bullet4);
          aqua.game.add(bullet5);
          aqua.game.add(bullet6);
          aqua.game.add(bullet7);
          aqua.game.add(bullet8);
          
          this.moveModel.energy -= 100;
          $('#energy').css('width',this.moveModel.energy+"%");
          this.firetimer = this.firedelay;
        }
      }
      this.firetimer -= aqua.game.timing.delta;
    }
  }
);

var ShipMove = aqua.type(aqua.Component,
  {
    init: function(def) {
      this.x = def.x || 300;
      this.y = def.y || 100;

      this.vx = 0;
      this.vy = 0;

      this.ax = 0;
      this.ay = 0;

      this.angle = 0;

      this.radius = def.radius || 25;
      
      this.score = 0;
      
      this.angle = 0;
      this.energy = 0;
      
      this.particle = aqua.Particle.create([this.x, this.y, 0], this.radius, 1);
      this.particle.isTrigger = true;
      this.particle.on('collision', this.oncollision.bind(this));
      this.particle.ship = this;
      this.particle.maxVelocity = (def.maxVelocity || 50) * 0.05;
      this.playing = false;
      this.decelState = 0;
    },
    onadd: function(gameObject) {
      this.input = gameObject.get(ShipInput);
      $('#energy').css('width',this.energy+"%");
    },
    ondestroy: function() {
      this.input = null;
    },
    ongameadd: function(gameObject, game) {
      game.world.addParticle(this.particle);
      this.game = game;
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
      if (otherParticle.enemy){
        this.game.destroy(this.gameObject);
      }
      if (otherParticle.bullet){
        if (!otherParticle.bullet.energyHarvested && otherParticle.bullet.isLive) {
          otherParticle.bullet.energyHarvested = true;
          if (energy < 100) {
            this.energy += 10;
          }
          $('#energy').css('width',this.energy+"%");
        }
      }
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

var ShipRasterRender = aqua.type(aqua.RasterRenderer,
  {
    init: function(def) {
      this.angle = 0;
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.call(this, def.image, ShipMove);
    },
    lateUpdate: function() {
      this.raster.position.x = this.transform.particle.position[0];
      this.raster.position.y = this.transform.particle.position[1];
      if (this.transform.angle != this.angle) {
        this.raster.rotate((this.transform.angle - this.angle) / 2 / Math.PI * 360);
        this.angle = this.transform.angle;
      }
    }
  }
);

btb.makeShip = function(gameObject) {
  return btb.make(load.get('ship/ship.json'));
};

btb.ShipInput = ShipInput;
btb.Ship = Ship;
btb.ShipMove = ShipMove;
btb.ShipRender = ShipRender;
btb.ShipRasterRender = ShipRasterRender;

});
})(this, this.load);
