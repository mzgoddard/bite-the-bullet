(function(window) {
  
  var aqua = window.aqua = {};
  
  aqua.type = function(prototype, members, properties, objectMembers) {
    properties = properties || {}, objectMembers = objectMembers || {};
    
    var exports = {}, key;
    exports.prototype = Object.create(prototype || {}, properties);
    
    for ( key in members ) {
      exports.prototype[key] = members[key];
    }
    
    if ( !exports.prototype.init ) {
      exports.prototype.init = function() {};
    }
    
    for ( key in objectMembers ) {
      exports[key] = objectMembers[key];
    }
    
    if ( !exports.create ) {
      exports.create = function() {
        var o = Object.create(exports.prototype);
        o.init.apply(o, arguments);
        return o;
      };
    }
    
    return exports;
  };
  
  aqua.type.Base = {};
  
  aqua.extend = function(a, b) {
    for (var key in b) {
      a[key] = b[key];
    }
    return a;
  };
  
  aqua.PriorityItem = aqua.type(aqua.type.Base,
    {
      init: function(callback, priority, before, once) {
        this.callback = callback;
        this.priority = priority || 0;
        this.before = before || false;
        this.once = once || false;
      },
      call: function() {
        this.callback.apply(null, arguments);
      }
    }
  );
  aqua.PriorityList = aqua.type(aqua.type.Base,
    {
      init: function() {
        this.items = [];
      },
      add: function(item) {
        var i = 0, added = false;
        
        for ( ; i < this.items.length; i++ ) {
          if (item.before && this.items[i].priority >= priority || 
            !item.before && this.items[i].priority > priority) 
          {
            this.items.splice(i, 0, item);
            added = true;
            break;
          }
        }
        
        if (!added) {
          this.items.push(item);
        }
      },
      remove: function(item) {
        var index = this.items.indexOf(item);
        
        if (index != -1) {
          this.items.splice(index, 1);
        }
        
        return this;
      },
      callAll: function() {
        var items = this.items, i = 0, item;
        
        for ( ; i < items.length; i++ ) {
          item = items[i];
          item.apply(item, arguments);
          
          if (item.once) {
            items.splice(i, 1);
            i--;
          }
        }
      }
    }
  );
  
})(this);

load.module('engine/init.js', when.all([
  load.script('engine/graphics.js'),
  load.script('engine/sound.js')
]), function() {
  
});
