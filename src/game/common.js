(function(window, load) {
load.module('game/bullet.js', null, function() {

var TallyType = aqua.type(aqua.Component, {
  
  init: function(def) {
    this.def = def;

  },
  
  ongameadd: function(gameObject,game) {
    console.log("IT IS A BOB");
  },
  
  ongamedestroy: function(gameObject,game) {
    
  },
  
  
  
});

btb.TallyType = TallyType;

});
})(this, this.load);