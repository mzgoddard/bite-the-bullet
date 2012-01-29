(function(window, load) {
load.module('game/bullet.js', null, function() {

var Bullet = aqua.type(aqua.Component,
  {
    radius: 5,
    startTime: 2,
    init: function(def) {
      this.def = def;
      this.angle = 0;
      this.particle = aqua.Particle.create([0, 0], this.radius, 1);
      if (def.position) {
        this.setPosition(def.position);
      }
      if (def.velocity) {
        this.setVelocity(def.velocity);
      }
      // this.particle.lastPosition[0] -= vel[0] * 0.05;
      // this.particle.lastPosition[1] -= vel[1] * 0.05;
      this.particle.isTrigger = true;
      this.particle.on('collision', this.oncollision.bind(this));
      this.particle.bullet = this;
      this.particle.maxVelocity = 200;
      this.startTimer = this.startTime;
    },
    onadd: function(gameObject) {
      gameObject.bullet = this;
    },
    ongameadd: function(gameObject, game) {
      this.game = game;
      game.world.addParticle(this.particle);

      this.world = game.world;
    },
    ongamedestroy: function(gameObject, game) {
      this.game = null;
      game.world.removeParticle(this.particle);
    },
    oncollision: function(other, collision) {
      if (this.startTimer < 0 && this.game) {
        if (other.bullet) {
          this.game.destroy(this.gameObject);
        }
        if (other.ship) {
          var ang = Math.PI+other.ship.angle % (Math.PI*2);//(-other.ship.angle + Math.PI/2) % (Math.PI*2);

          var dx = other.ship.particle.position[0] - this.particle.position[0];
          var dy = other.ship.particle.position[1] - this.particle.position[1];
          var v1 = vec3.normalize([dx,dy,0]);
          var v2 = vec3.normalize([Math.cos(ang),Math.sin(ang),0]);
          var mag = vec3.length(vec3.subtract(v2,v1));
          console.log(mag);
          if (mag < 0.6) {
            this.game.destroy(this.gameObject);
          }
          else {
            this.game.destroy(other.ship.gameObject);
          }
        }
      }
    },
    update: function() {
      this.startTimer -= aqua.game.timing.delta;
    },
    setPosition: function(pt) {
      this.particle.position[0]=pt[0];
      this.particle.position[1]=pt[1];
      var vx = this.particle.position[0] - this.particle.lastPosition[0],
          vy = this.particle.position[1] - this.particle.lastPosition[1];
      this.particle.lastPosition[0]=pt[0] - vx;
      this.particle.lastPosition[1]=pt[1] - vy;
    },
    setVelocity: function(pt) {
      this.particle.lastPosition[0] = (this.particle.position[0] - pt[0] * 0.05);
      this.particle.lastPosition[1] = (this.particle.position[1] - pt[1] * 0.05);
      this.angle = Math.atan2(
        this.particle.position[1] - this.particle.lastPosition[1],
        this.particle.position[0] - this.particle.lastPosition[0]);
    }
  },
  {
    isLive: {
      get: function() {
        return this.startTimer <= 0;
      }
    }
  }
);

var BulletRender = aqua.type(aqua.Component,
  {
    ongameadd: function(gameObject, game) {
      this.model = gameObject.get(Bullet);
      if (!this.path) {
        var radius = this.model.radius;
        radius = Math.sqrt(radius*radius+radius*radius);
        this.path = new paper.Path.Rectangle(new paper.Rectangle(-radius/2,-radius/2,radius,radius));
        this.path.fillColor = 'grey';
      }
    },
    ongamedestroy: function() {
      this.path.remove();
      delete this.path;
    },
    lateUpdate: function() {
      if (this.model.startTimer < 0) {
        this.path.fillColor = 'black';
      }
      this.path.position.x = this.model.particle.position[0];
      this.path.position.y = this.model.particle.position[1];
    }
  }
);

var BulletRasterRender = aqua.type(aqua.RasterRenderer,
  {
    init: function(def) {
      this.angle = 0;
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.call(this, def.image, Bullet);
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

btb.Bullet = Bullet;
btb.BulletRender = BulletRender;
btb.BulletRasterRender = BulletRasterRender

});
})(this, this.load);