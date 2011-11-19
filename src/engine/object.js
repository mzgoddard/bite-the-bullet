(function(window, aqua) {

var Game = aqua.type(aqua.type.Base,
  {
    init: function() {
      this.objects = [];
      this.tasks = aqua.PriorityList.create();
      
      this.task(this.call.bind(this, 'update'));
      this.task(this.call.bind(this, 'lateUpdate'));
    },
    add: function(object) {
      object.game = this;
      this.objects.push(object);
    },
    destroy: function(object) {
      this.task((function() {
        var index = this.objects.indexOf(object);
        
        if (index != -1) {
          object.game = null;
          this.objects.splice(index, 1);
        }
      }).bind(this), Game.Priorities.GARBAGE, false, true);
    },
    call: function(method) {
      var args = Array.prototype.slice.call(arguments, 1),
          objects = this.objects,
          count = objects.count,
          object,
          i;

      for ( i = 0; i < count; i++ ) {
        object = objects[i];
        object.apply(object, args);
      }
    },
    task: function(callback, priority, before, once) {
      this.tasks.add(aqua.PriorityItem.create.apply(aqua.PriorityItem, arguments));
    },
    step: function() {
      this.tasks.callAll(game);
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
    },
    destroy: function(component) {
      function remove() {
        var index = this.components.indexOf(component);

        if (index != -1) {
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
          count = components.count,
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

var Component = aqua.type(aqua.type.Base,
  {
    
  }
);

aqua.Game = Game;
aqua.GameObject = GameObject;
aqua.Component = Component;

})(this, this.aqua);