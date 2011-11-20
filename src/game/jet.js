(function(window, load) {

var glider = window.glider;

var Jet = aqua.type(aqua.Component,
  {
    onadd: function(gameObject) {
      this.world = gameObject;
    },
    fixedUpdate: function() {
      var cell = this.world.hash.cell(this.world.box.left + 320, 10),
          count = cell && cell.length,
          i,
          p;
      
      if (cell && cell.length) {
        for ( i = 0; i < count; i++ ) {
          p = cell[i];
          p.acceleration[1] += 10000;
        }
      }
    }
  }
);

glider.Jet = Jet;

})(this, this.load);