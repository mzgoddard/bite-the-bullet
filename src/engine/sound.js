(function(window, load) {

var document = window.document,
    setInterval = window.setInterval,
    clearInterval = window.clearInterval,
    when = window.when,
    aqua = window.aqua;

var SoundContext = aqua.type(aqua.type.Base,
  {
    init: function() {
      if (window.webkitAudioContext) {
        this.context = new window.webkitAudioContext();
        
        var clipsDefer = when.defer();
        
        when.chain(when.all([
          when(load.data('music/happy.ogg'), this._loadClip.bind(this, 'happy')),
          when(load.data('music/zone.ogg'), this._loadClip.bind(this, 'zone')),
          when(load.data('music/approach_danger.ogg'), this._loadClip.bind(this, 'approach')),
          when(load.data('music/danger.ogg'), this._loadClip.bind(this, 'danger'))
        ]), clipsDefer);
        
        clipsDefer.then(this._playAll.bind(this));
        
        this.nodes = {
          main: this.context.createGainNode()
        };
        
        this.nodes.main.connect(this.context.destination);
        
        document.addEventListener(
          'webkitvisibilitychange', 
          this.onvisibilitychange.bind(this));
        this.onvisibilitychange();
      }
    },
    onvisibilitychange: function() {
      if (document.webkitVisibilityState == 'visible') {
        if (this.visibilityInterval) {
          clearInterval( this.visibilityInterval );
        }
        
        var destination = 0,
            interval = setInterval((function() {
              this.nodes.main.gain.value = (destination += aqua.game.timing.delta);
              if (destination > 0.1) {
                this.nodes.main.gain.value = 0.1;
                clearInterval(interval);
              }
            }).bind( this ),50);
        this.visibilityInterval = interval;
      } else {
        this.nodes.main.gain.value = 0;
        
        if (this.visibilityInterval) {
          clearInterval(this.visibilityInterval);
        }
      }
    },
    _loadClip: function(name, clip) {
      var node = this.nodes[name] = {
        source: this.context.createBufferSource(),
        buffer: this.context.createBuffer(clip, false)
      };
      
      node.source.connect(this.nodes.main);
      node.source.buffer = node.buffer;
    },
    _playAll: function() {
      this.nodes.happy.source.noteOn(0);
      this.nodes.zone.source.noteOn(0);
      this.nodes.approach.source.noteOn(0);
      
      this.nodes.happy.source.loop = true;
      this.nodes.zone.source.loop = true;
      this.nodes.approach.source.loop = true;
      
      this.nodes.happy.source.gain.value = 0;
      this.nodes.zone.source.gain.value = 0;
      this.nodes.approach.source.gain.value = 0;
    }
  }
);

aqua.SoundContext = SoundContext;

})(this, this.load);