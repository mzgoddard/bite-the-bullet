(function(window, load) {
load.module('game/bullet.js', null, function() {

var tallyStuff = {};

var TallyType = aqua.type(aqua.Component, {
  
  init: function(def) {
    this.def = def;
    this.kind = "untracked";
    if (def.kind) {
      this.kind = def.kind;
    }
  },
  
  ongameadd: function(gameObject,game) {
    if (tallyStuff[this.kind]) {
      tallyStuff[this.kind] += 1;
    }
    else {
      tallyStuff[this.kind] = 1;
    }
    console.log(this.kind + " :" + tallyStuff[this.kind]);
  },
  
  ongamedestroy: function(gameObject,game) {
    tallyStuff[this.kind] -= 1;
    console.log(this.kind + " :" + tallyStuff[this.kind]);
  }
  
});

btb.TallyType = TallyType;

});
})(this, this.load);