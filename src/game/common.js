(function(window, load) {
load.module('game/bullet.js', null, function() {

var TallyType = aqua.type(aqua.Component, {
  
  init: function(def) {
    this.def = def;
    this.kind = "untracked";
    if (def.kind) {
      this.kind = def.kind;
    }
  },
  
  ongameadd: function(gameObject,game) {
    if (aqua.game.tallyStuff[this.kind]) {
      aqua.game.tallyStuff[this.kind] += 1;
    }
    else {
      aqua.game.tallyStuff[this.kind] = 1;
    }
    console.log(this.kind + " :" + aqua.game.tallyStuff[this.kind]);
  },
  
  ongamedestroy: function(gameObject,game) {
    aqua.game.tallyStuff[this.kind] -= 1;
    console.log(this.kind + " :" + aqua.game.tallyStuff[this.kind]);
    
    if (aqua.game.tallyStuff["enemy"] == 0 && aqua.game.tallyStuff["bullet"] == 0) {
      setTimeout("aqua.game.levelManager.transition()",3000);
    }
  }
  
});

btb.TallyType = TallyType;

});
})(this, this.load);