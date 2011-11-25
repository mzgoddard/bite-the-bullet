(function(window, load) {

var aqua = window.aqua,
    glider = window.glider;

var Jet = aqua.type(aqua.Component,
  {
    onadd: function(gameObject) {
      this.world = gameObject;
      
      this.particle = aqua.Particle.create([0,0,0], 20, 1);
      this.particle.isTrigger = true;
      this.particle.on('collision', this.oncollision.bind(this));
      
      this.world.addParticle(this.particle);
      this.x = this.world.box.left + this.world.box.width / 4 * 3;
    },
    oncollision: function(p, collision) {
      p.acceleration[1] += 4000;
    },
    fixedUpdate: function() {
      if (this.x < this.world.box.left) {
        this.x = this.world.box.right;
      }
      
      this.particle.position[0] = this.world.box.left + 320;
    }
  }
);

glider.Jet = Jet;

})(this, this.load);