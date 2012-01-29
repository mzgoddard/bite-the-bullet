(function(window, load) {
load.module('game/enemy.js', load.script('game/bullet.js'), function() {

var EnemySound = aqua.type(aqua.Component,
  {
    init: function(def) {
      this.def = def;
      this.sounds = 
      {      
        "explode": soundManager.createSound({
          id: 'aSound',
          url: 'data/enemy/sfx/explode-enemy1.wav'}),
        "bullet": soundManager.createSound({
          id: 'bSound',
          url: 'data/weapons/sfx/shoot-bullet.wav'}),
        "shipexplode": soundManager.createSound({
          id: 'cSound',
          url: 'data/ship/sfx/explode-ship1.wav'})
      };
    },
    
    play: function(name) {
      if (this.sounds[name]) {
        this.sounds[name].play();
      }
      else return(false);
    }
    

  }
);

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
      this.soundModel = gameObject.get(EnemySound);
      this.game = game;
      game.world.addParticle(this.particle);
      this.particle.lastPosition[0] -= (this.def.velocity ? this.def.velocity[0] : 10) * 0.02;
      this.particle.lastPosition[1] -= (this.def.velocity ? this.def.velocity[1] : 10) * 0.02;
      this.angle = Math.atan2(
        this.particle.position[1] - this.particle.lastPosition[1],
        this.particle.position[0] - this.particle.lastPosition[0]);
    },
    ongamedestroy: function(gameObject, game) {
      delete this.gameObject;
      delete this.game;
      game.world.removeParticle(this.particle);
      this.soundModel.play("explode");
    },
    oncollision: function(other, collision) {
      if (other.enemy) return;
      if (other.bullet && !other.bullet.isLive && other.source == this.particle) return;
      if (other.ship) return;
      this.gameObject.destroy(this);
      if (other.bullet) {
        this.game.destroy(other.bullet.gameObject);
      }      
      this.call('hit');
      var game = this.game, gameObject = this.gameObject;
      setTimeout((function() {
        game.destroy(gameObject);
      }).bind(this), 250);
    }
  }
);

var EnemyMoveSpread = aqua.type(EnemyMove,
  {
    init: function(def) {
      this.def = def;
      this.particle = aqua.Particle.create((def.position || [100, 100]), (def.radius || 10), 1);
      this.particle.isTrigger = true;
      this.particle.on('collision', this.oncollision.bind(this));
      this.particle.enemy = this;
    },
    update: function() {
      playerPos = aqua.game.player.get(btb.ShipMove).particle.position;
      this.angle = Math.atan2(
        this.particle.position[1] - playerPos[1],
        this.particle.position[0] - playerPos[0]
      )+Math.PI;
    },
    ongameadd: function(gameObject, game) {
      this.gameObject = gameObject;
      this.soundModel = gameObject.get(EnemySound);
      this.game = game;
      game.world.addParticle(this.particle);
      this.particle.lastPosition[0] -= (this.def.velocity ? this.def.velocity[0] : 10) * 0.02;
      this.particle.lastPosition[1] -= (this.def.velocity ? this.def.velocity[1] : 10) * 0.02;
      this.angle = Math.atan2(
        this.particle.position[1] - this.particle.lastPosition[1],
        this.particle.position[0] - this.particle.lastPosition[0]);
    },
    ongamedestroy: function(gameObject, game) {
      delete this.gameObject;
      delete this.game;
      game.world.removeParticle(this.particle);
      this.soundModel.play("explode");
    },
    oncollision: function(other, collision) {
      if (other.enemy) return;
      if (other.bullet && !other.bullet.isLive && other.source == this.particle) return;
      if (other.ship) return;
      this.gameObject.destroy(this);
      if (other.bullet) {
        this.game.destroy(other.bullet.gameObject);
      }    
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
      fireDelay: 2
    },
    init: function(def) {
      this.def = def;
      this.fireTimer = this.def.fireDelay || this.defaults.fireDelay;
    },
    onadd: function(gameObject) {
      this.moveModel = gameObject.get(EnemyMove);
      this.soundModel = gameObject.get(EnemySound);
    },
    update: function() {
      this.fireTimer -= aqua.game.timing.delta;
      if (this.fireTimer <= 0) {
        this.fire();
        this.fireTimer = this.def.fireDelay || this.defaults.fireDelay;
      }
    },
    fire: function() {
      var speed = this.def.bulletSpeed || 30,
          bullet = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
            position:
              [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
            velocity:
              [Math.cos(this.moveModel.angle) * speed,
               Math.sin(this.moveModel.angle) * speed],
           source:
             this.moveModel.particle
          }}));
      // console.log(btb.make(this.def.bullet));

      aqua.game.add(bullet);
      this.soundModel.play("bullet");
    }
  }
);

var EnemyAttackSpread = aqua.type(EnemyAttack,
  {
    defaults: {
      fireDelay: 3
    },
    init: function(def) {
      this.def = def;
      this.fireTimer = this.def.fireDelay || this.defaults.fireDelay;
    },
    onadd: function(gameObject) {
      this.moveModel = gameObject.get(EnemyMove);
    this.soundModel = gameObject.get(EnemySound);

    },
    update: function() {
      this.fireTimer -= aqua.game.timing.delta;
      if (this.fireTimer <= 0) {
        this.fire();
        this.fireTimer = this.def.fireDelay || this.defaults.fireDelay;
      }
    },
    fire: function() {
      var speed = this.def.bulletSpeed || 30,
          bullet = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
            position:
              [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
            velocity:
              [Math.cos(this.moveModel.angle) * speed,
               Math.sin(this.moveModel.angle) * speed],
           source:
             this.moveModel.particle
          }})),
          bullet2 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
            position:
              [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
            velocity:
              [Math.cos(this.moveModel.angle+Math.PI/8) * speed,
               Math.sin(this.moveModel.angle+Math.PI/8) * speed],
           source:
             this.moveModel.particle
          }})),
          bullet3 = btb.make(jQuery.extend(true, {}, this.def.bullet, {"model":{
            position:
              [this.moveModel.particle.position[0],this.moveModel.particle.position[1]],
            velocity:
              [Math.cos(this.moveModel.angle-Math.PI/8) * speed,
               Math.sin(this.moveModel.angle-Math.PI/8) * speed],
            source:
              this.moveModel.particle
          }}));

      aqua.game.add(bullet);
      aqua.game.add(bullet2);
      aqua.game.add(bullet3);
      this.soundModel.play("bullet");

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
        this.game.add(btb.make(this.def));
        this.game.destroy(this.gameObject);
      }
      this.timer -= this.game.timing.delta;
    }
  }
);

btb.Enemy = aqua.type(aqua.Component, {});
btb.Enemy.Move = EnemyMove;
btb.Enemy.MoveSpread = EnemyMoveSpread;
btb.Enemy.Attack = EnemyAttack;
btb.Enemy.AttackSpread = EnemyAttackSpread;
btb.Enemy.Render = EnemyRender;
btb.Enemy.RasterRender = EnemyRasterRender;
btb.Enemy.Spawner = EnemySpawner;
btb.Enemy.Sound = EnemySound;

btb.EnemyMove = EnemyMove;
btb.EnemyMoveSpread = EnemyMoveSpread;
btb.EnemyAttack = EnemyAttack;
btb.EnemyAttackSpread = EnemyAttackSpread;
btb.EnemyRender = EnemyRender;
btb.EnemyRasterRender = EnemyRasterRender;
btb.EnemySpawner = EnemySpawner;
btb.EnemySound = EnemySound;

btb.makeEnemy = function(definition) {
  var enemy = aqua.GameObject.create();
  
  enemy.add((btb.Enemy[definition.sound.type || "Sound"]).create(definition.sound));
  enemy.add((btb.Enemy[definition.move.type || "Move"]).create(definition.move));
  enemy.add((btb.Enemy[definition.attack.type || "Attack"]).create(definition.attack));
  enemy.add((btb.Enemy[definition.render.type || "Render"]).create(definition.render));

  return enemy;
};

btb.make = function(definition) {
  var object = aqua.GameObject.create(), key, componentCls, keys, order, i;
  definition = load.definition(definition);

  keys = Object.keys(definition);

  if (definition.components) {
    keys = definition.components;
  } else {
    if (definition.order) {
      definition.order.forEach(function(i) {
        var index = keys.indexOf(i);
        if (index != -1) {
          keys.splice(index, 1);
        }
      });
      order = definition.order.slice();
      order.splice(0, 0, 0, 0);
      keys.splice.apply(keys, order);
    }

    ['files', 'file', 'order'].forEach(function(i) {
      var index = keys.indexOf(i);
      if (index != -1) {
        keys.splice(index, 1);
      }
    });
  }

  for (i = 0; i < keys.length; i++) {
    componentCls = null;
    key = keys[i];
    if (definition[key].type) {
      componentCls = btb[definition[key].type];
      if (!componentCls) {
        componentCls = btb['Enemy' + definition[key].type];
      }
    }
    if (!componentCls) {
      componentCls = btb[key];
      if (!componentCls) {
        componentCls = btb[key.charAt(0).toUpperCase()+key.substring(1)];
        if (!componentCls) {
          componentCls = btb['Enemy'+key.charAt(0).toUpperCase()+key.substring(1)];
        }
      }
    }
    if (componentCls) {
      object.add(componentCls.create(definition[key]));
    } else {
      console.error('no such component type "'+ key +'".');
    }
  }

  return object;
};

});
})(this, this.load);