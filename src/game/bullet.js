(function(window, load) {
load.module('game/bullet.js', null, function() {

var Bullet = aqua.type(aqua.Component,
  {
    radius: 5,
    startTime: 1,
    init: function(pos, vel) {
      this.angle
      this.particle = aqua.Particle.create([0+pos[0], 0+pos[1]], Bullet.radius, 1);
      this.particle.isTrigger = true;
      this.particle.oncollision = this.oncollision.bind(this);
      this.particle.bullet = this;
      this.startTimer = startTime;
    },
    ongameadd: function(gameObject, game) {
      game.world.addParticle(this.particle);

      this.world = game.world;
    },
    ongamedestroy: function(gameObject, game) {
      game.world.removeParticle(this.particle);
    },
    oncollision: function(other, collision) {
      if (this.startTimer < 0) {
        this.game.destroy(this.gameObject);
      }
    },
    update: function() {
      this.startTimer -= aqua.game.timing.delta;
    }
  }
);

var BulletRender = aqua.type(aqua.Component,
  {
    onadd: function(gameObject) {
      this.model = gameObject.get(Bullet);
      if (!this.path) {
        var radius = this.model.radius;
        this.path = new paper.Path.Rectangle(new paper.Rectangle(-radius/2,-radius/2,radius,radius));
      }
    },
    ondestroy: function() {
      this.path.remove();
      delete this.path;
    },
    lateUpdate: function() {
      this.path.position.x = this.model.particle.position[0];
      this.path.position.y = this.model.particle.position[1];
    }
  }
);

btb.Bullet = Bullet;
btb.BulletRender = BulletRender;

});
})(this, this.load);