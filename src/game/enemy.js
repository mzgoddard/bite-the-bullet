(function(window, load) {
load.module('game/enemy.js', load.script('game/bullet.js'), function() {

var EnemyMove = aqua.type(aqua.Component,
  {
    init: function(def) {
      this.def = def;
      this.particle = aqua.Particle.create((def.position || [100, 100]), (def.radius || 10), 1);
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
      this.gameObject.destroy(this);

      var game = this.game, gameObject = this.gameObject;
      setTimeout((function() {
        game.destroy(gameObject);
      }).bind(this), 250);
    }
  }
);

var EnemyAttack = aqua.type(aqua.Component,
  {
    init: function(def) {
      
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
      this.path.fillColor = this.def.color || 'red';
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
    }
  }
);

btb.Enemy = {};
btb.Enemy.Move = EnemyMove;
btb.Enemy.Attack = EnemyAttack;
btb.Enemy.Render = EnemyRender;

btb.makeEnemy = function(definition) {
  var enemy = aqua.GameObject.create();

  enemy.add((btb.Enemy[definition.move.type || "Move"]).create(definition.move));
  enemy.add((btb.Enemy[definition.attack.type || "Attack"]).create(definition.attack));
  enemy.add((btb.Enemy[definition.render.type || "Render"]).create(definition.render));

  return enemy;
};

});
})(this, this.load);