(function(window, aqua) {

var Game = aqua.type(aqua.type.Base,
  {
    init: function() {
      this.objects = [];
      this.tasks = aqua.PriorityList.create();
      
      this.task(this.call.bind(this, 'update'));
      this.task(this.call.bind(this, 'lateUpdate'), Game.Priorities.LATE_UPDATE);
    },
    add: function(object) {
      object.game = this;
      this.objects.push(object);
      
      if (object.ongameadd)
        object.ongameadd(this);
      object.call('ongameadd', object, this);
    },
    destroy: function(object) {
      this.task((function() {
        var index = this.objects.indexOf(object);
        
        if (index != -1) {
          if (object.ongamedestroy)
            object.ongamedestroy(this);
          object.call('ongamedestroy', object, this);
          
          object.game = null;
          
          this.objects.splice(index, 1);
        }
      }).bind(this), Game.Priorities.GARBAGE, false, true);
    },
    call: function(method) {
      var args = Array.prototype.slice.call(arguments, 1),
          objects = this.objects,
          count = objects.length,
          object,
          i;

      for ( i = 0; i < count; i++ ) {
        object = objects[i];
        object.call.apply(object, arguments);
      }
    },
    task: function(callback, priority, before, once) {
      var item = aqua.PriorityItem.create.apply(aqua.PriorityItem, arguments);
      this.tasks.add(item);
      return item;
    },
    step: function() {
      this.tasks.callAll(this);
    },
    main: function() {
      // put common timing and rAF loop logic in here
    },
    pause: function() {
      
    },
    resume: function() {
      
    }
  },
  {},
  {
    Priorities: {
      UPDATE: 0,
      LATE_UPDATE: 5,
      RENDER: 10,
      GARBAGE: 20
    }
  }
);

var GameObject = aqua.type(aqua.type.Base,
  {
    init: function() {
      this.components = [];
    },
    add: function(component) {
      component.gameObject = this;
      this.components.push(component);

      component.onadd(this);
      if (this.game) {
        component.ongameadd(this, this.game);
      }

      return component;
    },
    get: function(typeObject) {
      var components = this.components,
          count = components.length,
          prototype = typeObject.prototype,
          component,
          i;

      for ( i = 0; i < count; i++ ) {
        component = components[i];
        if ( prototype.isPrototypeOf( component ) ) {
          return component;
        }
      }
      
      // yay, explicit-ness-ness
      return null;
    },
    destroy: function(component) {
      function remove() {
        var index = this.components.indexOf(component);

        if (index != -1) {
          component.ondestroy(this);
          if (this.game) {
            component.ongamedestroy(this, this.game);
          }
          
          component.gameObject = null;
          
          this.components.splice(index, 1);
        }
      }
      
      if (this.game) {
        this.game.task(remove.bind(this), Game.Priorities.GARBAGE, false, true);
      } else {
        remove.call(this);
      }
    },
    call: function(method) {
      var args = Array.prototype.slice.call(arguments, 1), 
          components = this.components,
          count = components.length,
          component,
          i;

      for ( i = 0; i < count; i++ ) {
        component = components[i];
        if (component[method]) {
          component[method].apply(component, args);
        }
      }
    }
  }
);

var Component = aqua.type(aqua.Emitter,
  {
    // onadd: when added to object
    onadd: function(gameObject){},
    // ongameadd: when added to object to a game object
    ongameadd: function(gameObject, game){},
    
    ondestroy: function(gameObject){},
    ongamedestroy: function(gameObject, game){}
  }
);

aqua.Game = Game;
aqua.GameObject = GameObject;
aqua.Component = Component;

})(this, this.aqua);