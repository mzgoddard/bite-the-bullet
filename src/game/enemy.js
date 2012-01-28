(function(window, load) {
load.module('game/enemy.js', load.script('game/bullet.js'), function() {

var EnemyMove = aqua.type(aqua.Component,
  {
    init: function(def) {
      this.def = def;
      this.particle = aqua.Particle.create((def.position || [100, 100]), (def.radius || 10), 1);
      this.particle.isTrigger = true;
      this.particle.on('collision', this.oncollision.bind(this));
      this.particle.enemy = this;
    },
    ongameadd: function(gameObject, game) {
      this.gameObject = gameObject;
      this.game = game;
      game.world.addParticle(this.particle);
      this.particle.lastPosition[0] -= (this.def.velocity && this.def.velocity[0] || 10) * 0.05;
      this.particle.lastPosition[1] -= (this.def.velocity && this.def.velocity[1] || 10) * 0.05;
      this.angle = Math.atan2(
        this.particle.position[1] - this.particle.lastPosition[1],
        this.particle.position[0] - this.particle.lastPosition[0]);
    },
    ongamedestroy: function(gameObject, game) {
      delete this.gameObject;
      delete this.game;
      game.world.removeParticle(this.particle);
    },
    oncollision: function(other, collision) {
      if (other.enemy) return;
      if (other.bullet && !other.bullet.isLive) return;
      if (other.ship) return;
      this.gameObject.destroy(this);

      this.call('hit');
      var game = this.game, gameObject = this.gameObject;
      setTimeout((function() {
        game.destroy(gameObject);
      }).bind(this), 250);
    }
  }
);

var EnemyAttack = aqua.type(aqua.Component,
  {
    defaults: {
      fireDelay: 1
    },
    init: function(def) {
      this.def = def;
      this.fireTimer = this.def.fireDelay || this.defaults.fireDelay;
    },
    onadd: function(gameObject) {
      this.moveModel = gameObject.get(EnemyMove);
    },
    update: function() {
      this.fireTimer -= aqua.game.timing.delta;
      if (this.fireTimer <= 0) {
        this.fire();
        this.fireTimer = this.def.fireDelay || this.defaults.fireDelay;
      }
    },
    fire: function() {
      var bullet = aqua.GameObject.create(),
          speed = this.def.bulletSpeed || 30;
      bullet.add(btb.Bullet.create(
        [this.moveModel.particle.position[0],this.moveModel.particle.position[1]], 
        [Math.cos(this.moveModel.angle) * speed + this.moveModel.particle.velocity[0] / 0.05,
         Math.sin(this.moveModel.angle) * speed + this.moveModel.particle.velocity[1] / 0.05]));
      bullet.add(btb.BulletRender.create());

      aqua.game.add(bullet);
    }
  }
);

var EnemyRender = aqua.type(aqua.Component,
  {
    init: function(def) {
      this.def = def;
    },
    onadd: function(gameObject) {
      this.moveModel = gameObject.get(EnemyMove);
    },
    ongameadd: function(gameObject, game) {
      this.pathAngle = 0;
      var radius = this.moveModel.particle.radius;
      radius = Math.sqrt(radius*radius+radius*radius);
      this.path = new paper.Path.Rectangle(new paper.Rectangle(-radius/2,-radius/2,radius,radius));
      this.path.fillColor = this.def.color || 'orange';
      // console.log(this.moveModel.on);
      this.moveModel.on('hit', this.onhit.bind(this));
    },
    ongamedestroy: function(gameObject, game) {
      this.path.remove();
      delete this.path;
    },
    lateUpdate: function() {
      this.path.position.x = this.moveModel.particle.position[0];
      this.path.position.y = this.moveModel.particle.position[1];

      if (this.moveModel.angle != this.pathAngle) {
        this.path.rotate((this.moveModel.angle - this.pathAngle) / 2 / Math.PI * 360);
        this.pathAngle = this.moveModel.angle;
      }
    },
    onhit: function() {
      this.path.fillColor = this.def.hitColor || 'red';
    }
  }
);

var EnemyRasterRender = aqua.type(aqua.RasterRenderer,
  {
    init: function(def) {
      this.angle = 0;
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.call(this, def.image, EnemyMove);
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

var EnemySpawner = aqua.type(aqua.Component,
  {
    init: function(def) {
      this.def = def;
      this.timer = def.spawnDelay || 1;
    },
    ongameadd: function(gameObject, game) {
      this.gameObject = gameObject;
      this.game = game;
    },
    update: function() {
      if (this.timer < 0) {
        this.game.add(btb.makeEnemy(this.def));
        this.game.destroy(this.gameObject);
      }
      this.timer -= this.game.timing.delta;
    }
  }
);

btb.Enemy = {};
btb.Enemy.Move = EnemyMove;
btb.Enemy.Attack = EnemyAttack;
btb.Enemy.Render = EnemyRender;
btb.Enemy.RasterRender = EnemyRasterRender;
btb.Enemy.Spawner = EnemySpawner;

btb.makeEnemy = function(definition) {
  var enemy = aqua.GameObject.create();

  enemy.add((btb.Enemy[definition.move.type || "Move"]).create(definition.move));
  enemy.add((btb.Enemy[definition.attack.type || "Attack"]).create(definition.attack));
  enemy.add((btb.Enemy[definition.render.type || "Render"]).create(definition.render));

  return enemy;
};

});
})(this, this.load);