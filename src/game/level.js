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

      if (typeof(def) == "object") {
        this.def = def;
        this.load(def.files);
      } else if (this.jsonRE.test(def.trim())) {
        this.def = JSON.parse(def);
        this.load(this.def.files);
      } else {
        load.text(def).then((function(){
          this.def = JSON.parse(load.get(def));
          this.load(this.def.files);
        }).bind(this));
      }
    },
    load: function(files) {
      if (!files) return;

      var i;
      this.waiting += files.length;
      for (i = 0; i < files.length; i++) {
        load.load(files[i])
        .then((function(filepath){
          console.log(filepath, load.type(filepath));
          if (load.type(filepath) == "json") {
            this.load(load.get(filepath).files);
          }
        
          this.waiting--;
          if (this.waiting == 0) {
            this.ready.resolve();
          }
        }).bind(this, files[i]));
      }
    },
    loadEnemy: function(object, json) {
      if (json.file) {
        this.loadEnemy(object, load.get(json.file));
      }
      return jQuery.extend(true, object, json);
    },
    start: function() {
      this.ready.then((function(){
        console.log('start');
        $('#title').text(this.def.title);
        var i, j, enemy, enemyDef, spawner;
        for (i = 0; i < this.def.enemies.length; i++) {
          console.log(i);
          enemy = this.def.enemies[i];
          enemyDef = {};
          enemyDef = this.loadEnemy(enemyDef, enemy);

          for (j = 0; j < (enemyDef.spawnCount || 1); j++) {
            console.log(j);
            spawner = aqua.GameObject.create();
            console.log(spawner);
            spawner.add(btb.Enemy.Spawner.create(enemyDef));
            console.log(spawner);
            aqua.game.add(spawner);
            console.log(spawner);
          }
        }
      }).bind(this));
    }
  }
);

var LevelManager = aqua.type(aqua.GameObject,
  {
    init: function() {
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.call(this);
      this.level = null;
      this.levelIndex = 0;

      this.gameObject = this;
      this.next();
    },
    next: function() {
      this.level = Level.create("levels/level" + (++this.levelIndex) + ".json");
      this.gameObject.add(this.level);
      this.level.start();
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