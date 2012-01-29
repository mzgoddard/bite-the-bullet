(function(window, load) {
load.module('game/ship.js', load.script('game/bullet.js'), function() {

var when = window.when;

var Level = aqua.type(aqua.Component,
  {
    jsonRE: /^{/,
    // def is either string of file path or json
    init: function(def) {
      this.ready = when.defer();
      this.waiting = 0;
      
      var promise;

      if (typeof(def) == "object") {
        this.def = def;
        promise = load.package(def);
      } else if (this.jsonRE.test(def.trim())) {
        promise = load.package(def);
        this.def = JSON.parse(def);
      } else {
        promise = load.package(def);
        promise.then((function() {
          this.def = load.get(def);
        }).bind(this));
      }
      
      

      when.chain(promise, this.ready);
    },
    loadEnemy: function(object, json) {
      if (json.file) {
        this.loadEnemy(object, load.get(json.file));
      }
      return jQuery.extend(true, object, json);
    },
    start: function() {
      this.ready.then((function(){
        $("#title").text(this.def.title);
        var i, j, enemy, enemyDef, spawner;
        for (i = 0; i < this.def.enemies.length; i++) {
          enemy = this.def.enemies[i];

          spawner = aqua.GameObject.create();
          spawner.add(btb.Enemy.Spawner.create(enemy));
          aqua.game.add(spawner);
        }
      }).bind(this));
    }
  }
);

var LevelManager = aqua.type(aqua.GameObject,
  {
    init: function() {
      console.log('huh?');
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.call(this);
      this.level = null;
      this.levelIndex = parseInt(aqua.query('level', 1)) - 1;

      this.gameObject = this;
      this.next();
    },
    next: function() {
      $('#levelcomplete').hide();
      this.level = Level.create("levels/level" + (++this.levelIndex) + ".json");
      this.gameObject.add(this.level);
      this.level.start();
      aqua.game.player.components[0].gameObject.components[1].particle.position[0] = 400;
      aqua.game.player.components[0].gameObject.components[1].particle.lastPosition[0] = 400;
      aqua.game.player.components[0].gameObject.components[1].particle.position[1] = 300;
      aqua.game.player.components[0].gameObject.components[1].particle.lastPosition[1] = 300;
    },
    repeat: function() {
      $('#levelcomplete').hide();
      this.level = Level.create("levels/level" + (this.levelIndex) + ".json");
      this.gameObject.add(this.level);
      this.level.start();
      aqua.game.player.components[0].gameObject.components[1].particle.position[0] = 400;
      aqua.game.player.components[0].gameObject.components[1].particle.lastPosition[0] = 400;
      aqua.game.player.components[0].gameObject.components[1].particle.position[1] = 300;
      aqua.game.player.components[0].gameObject.components[1].particle.lastPosition[1] = 300;
    },
    transition: function() {
      $('#levelcomplete').show();
    },
    cheat: function() {
      
    }
  },
  {},
  {
    makeLevelManager: function() {
      var object = LevelManager.create();
      return object;
    }
  }
);

btb.Level = Level;
btb.LevelManager = LevelManager;

});
})(this, this.load);