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
      $('#titlescreen').show();
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.call(this);
      this.level = null;
      this.levelIndex = parseInt(aqua.query('level', 1)) - 1;
      
      this.sounds = 
      {      
        "load": soundManager.createSound({
          id: 'hSound',
          url: 'data/levels/sfx/level-spawn.wav'}),
        "win": soundManager.createSound({
          id: 'iSound',
          url: 'data/levels/sfx/level-win.wav'})
      };
      
      
      soundManager.createSound({
        id: 'bgm',
        url: 'data/levels/sfx/bgm.mp3',
        autoLoad: true,
        autoPlay: true,
        onfinish: function() {
          this.play();
        },        
        volume: 80
      });

      this.gameObject = this;
    },
    next: function() {
      aqua.game.levelManager.sounds["load"].play();
      $('#titlescreen').hide();
      aqua.game.tallyStuff["enemy"] -= 1;
      $('#levelcomplete').hide();
      $('#leveldied').hide();
      if (this.levelIndex == 10) {
        $('#levelcomplete').hide();
        $('#leveldied').hide();
        $('#nomorelevels').show();
      }
      else{
        this.level = Level.create("levels/level" + (++this.levelIndex) + ".json");
        this.gameObject.add(this.level);
        this.level.start();
        aqua.game.player.get(btb.ShipMove).particle.position[0] = 400;
        aqua.game.player.get(btb.ShipMove).particle.lastPosition[0] = 400;
        aqua.game.player.get(btb.ShipMove).particle.position[1] = 300;
        aqua.game.player.get(btb.ShipMove).particle.lastPosition[1] = 300;
      }
    },
    repeat: function() {
      aqua.game.levelManager.sounds["load"].play();
      aqua.game.tallyStuff["enemy"] -= 1;
      $('#levelcomplete').hide();
      $('#leveldied').hide();
      this.level = Level.create("levels/level" + (this.levelIndex) + ".json");
      this.gameObject.add(this.level);
      this.level.start();
      aqua.game.player.get(btb.ShipMove).particle.position[0] = 400;
      aqua.game.player.get(btb.ShipMove).particle.lastPosition[0] = 400;
      aqua.game.player.get(btb.ShipMove).particle.position[1] = 300;
      aqua.game.player.get(btb.ShipMove).particle.lastPosition[1] = 300;
    },
    transition: function() {
      $('#levelcomplete').show();
      aqua.game.levelManager.sounds["win"].play();

      aqua.game.tallyStuff["enemy"] += 1;
    },
    playerdied: function() {
      $('#leveldied').show();    
      aqua.game.tallyStuff["enemy"] += 1;
      aqua.game.objects.forEach(
        function(gameObject) {
          if (gameObject.get(btb.Bullet) || gameObject.get(btb.ShipMove) || gameObject.get(btb.EnemyMove)) {
            aqua.game.destroy(gameObject); 
          }
        }
      );
      aqua.game.player = btb.makeShip();
      aqua.game.add(aqua.game.player);
      
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