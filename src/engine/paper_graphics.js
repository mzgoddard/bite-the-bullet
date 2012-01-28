(function(window, load) {
load.module('engine/paper_graphics.js', null, function() {

var Graphics = aqua.type(aqua.type.Base,
  {
    init: function() {
      this.rasters = {};
      this.animations = {};

      this.symbols = {};
    },
    hasRaster: function(path) {
      return !!this.rasters[path];
    },
    loadRaster: function(path) {
      if (!this.rasters[path]) {
        this.rasters[path] = new paper.Raster(load.get(path));
        this.rasters[path].remove();
        this.symbols[path] = new paper.Symbol(this.rasters[path]);
      }
      return this.rasters[path];
    },
    saveRaster: function(path, raster) {
      this.rasters[path] = raster;
      return raster;
    },
    loadSymbol: function(path) {
      if (!this.rasters[path]) {
        this.rasters[path] = new paper.Raster(load.get(path));
        this.rasters[path].remove();
        this.symbols[path] = new paper.Symbol(this.rasters[path]);
      }
      return this.symbols[path];
    },
    loadAnimation: function(path) {
      if (!this.animations[path]) {
        this.animations[path] = Animation.create(path);
      }
      return this.animations[path];
    }
  }
);

var Animation = aqua.type(aqua.type.Base,
  {
    init: function(path) {
      this.framesets = {};
      this.rasters = [];
      this.symbols = [];
      this.names = [];

      this.def = load.definition(path);

      
    },
    get: function(name, time) {
      
    }
  }
);

var Transform = aqua.type(aqua.Component,
  {
    init: function() {
      this.position = [];
      this.angle = 0;
    }
  }
);

var RasterRenderer = aqua.type(aqua.Component,
  {
    init: function(path, transformClass) {
      this.path = path;
      this.transformClass = transformClass || Transform;
    },
    ongameadd: function(gameObject, game) {
      this.game = game;
      this.transform = gameObject.get(this.transformClass);
      if (!this.raster) {
        this.raster = new paper.PlacedSymbol(game.graphics.loadSymbol(this.path));
      }
    },
    ongamedestroy: function() {
      this.raster.remove();
      delete(this.raster);
    },
    lateUpdate: function() {
      this.raster.position.x = this.transform.position[0];
      this.raster.position.y = this.transform.position[1];
      if (this.transform.angle != this.angle) {
        this.raster.rotate(this.angle - this.transform.angle);
        this.transform.angle = this.angle;
      }
    }
  }
);

var AnimationRenderer = aqua.type(RasterRenderer,
  {
    
  }
);

aqua.Graphics = Graphics;
aqua.Transform = Transform;
aqua.RasterRenderer = RasterRenderer;

});
})(this, this.load);