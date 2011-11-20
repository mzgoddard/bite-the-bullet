(function(window, load) {

var when = window.when,
    aqua = window.aqua;

var SoundContext = aqua.type(aqua.type.Base,
  {
    init: function() {
      console.log('sound:', window.webkitAudioContext);
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
        
          console.log(this.context);
      }
    },
    _loadClip: function(name, clip) {
      console.log(arguments);
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