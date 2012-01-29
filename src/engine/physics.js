(function(window, load) {

var ArrayBuffer = window.ArrayBuffer,
    Float32Array = window.Float32Array,
    Uint8Array = window.Uint8Array,
    when = window.when, 
    aqua = window.aqua,
    vec3 = window.vec3;

load.module('engine/physics.js', 
  when.all([
    load.script('engine/object.js'),
    load.script('engine/paper_graphics.js'),
    // load.script('engine/graphics.js'),
    load.script('engine/math.js')
  ]), function() {

var posmul = 2, lastposmul = 1, friction = 0;
var Particle = aqua.type(aqua.Emitter,
  {
    init: function(position, radius, density) {
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.apply(this);
      
      this.position = (position).slice();
      this.lastPosition = (position).slice();
      this.oldPosition = (position).slice();
      
      this.velocity = ([0,0,0]);
      this.acceleration = ([0,0,0]);
      this.angle = 0;
      this.maxVelocity = 5;
      
      this.temporaryPosition = (position).slice();
      
      this.radius = radius;
      this.mass = density * radius * radius;
      
      this.mask = Particle.Masks.LIQUID;
      this.collisionMask = Particle.Masks.ALL;
      
      this.friction = friction;
    },
    integrate: function(dt) {
      if ( !this.isStatic ) {
        vec3.set(this.position, this.temporaryPosition);
        vec3.add(
          vec3.subtract(
            vec3.scale(this.position, posmul, this.position),
            vec3.scale(this.lastPosition, lastposmul, this.lastPosition),
            this.position
          ),
          vec3.scale(this.acceleration, dt * dt, this.acceleration),
          this.position
        );
      
        vec3.set(this.temporaryPosition, this.lastPosition);
      }
      
      this.x = this.position[0];
      this.y = this.position[1];
      this.lx = this.lastPosition[0];
      this.ly = this.lastPosition[1];
      this.velocity[0] = this.position[0]-this.lastPosition[0];
      this.velocity[1] = this.position[1]-this.lastPosition[1];
      
      if (vec3.dot(this.velocity,this.velocity) > this.maxVelocity*this.maxVelocity) {
        this.velocity = vec3.scale(vec3.normalize(this.velocity),this.maxVelocity);
        this.x = this.lastPosition[0] + this.velocity[0];
        this.y = this.lastPosition[1] + this.velocity[1];
        this.position[0] = this.x;
        this.position[1] = this.y;
      }
      
      this.angle = Math.PI/2-Math.atan(this.velocity[1]/this.velocity[0]);
      if (this.velocity[0] < 0) this.angle = Math.PI+this.angle;
      
      // zero acceleration
      for ( var i = 0; i < 3; i++ )
        this.acceleration[i] = 0;
    },
    test: function(other, collision) {
      if ( this.isStatic && other.isStatic ) return false;

      // if ( this.mask & other.collisionMask == 0 || 
      //   other.mask & this.collisionMask == 0 ) {
      //   return false;
      // }

      var ax = this.x,
          ay = this.y,
          ar = this.radius,
          bx = other.x,
          by = other.y,
          br = other.radius,
          c = collision,
          ingress;

      ingress = Math.pow(ax-bx,2)+Math.pow(ay-by,2);
      if (((ingress < Math.pow(ar + br, 2)))) {
        c.ingression = ingress = Math.mag(ax-bx,ay-by);
        c.weight = ar + br;
        c.distance = c.ingression - c.weight;

        // ingression = max(ingression, (ar + br) - c.ingression);
        // bingression = max(bingression, (ar + br) - c.ingression);

        var lx = ax - bx,
            ly = ay - by, 
            al = ingress,
            pt = (al - ar) / al,
            qt = br / al;
        c.px = bx + Math.lerp(0, lx, pt);
        c.py = by + Math.lerp(0, ly, pt);
        c.qx = bx + Math.lerp(0, lx, qt);
        c.qy = by + Math.lerp(0, ly, qt);
        
        return true;
      }
      
      return false;
    },
    solve: function(other, collision) {
      var 
        a = this,
        b = other,
        c = collision,
        lambx = (c.qx - c.px) * 0.5,
        lamby = (c.qy - c.py) * 0.5,
        amsq = a.mass,
        bmsq = b.mass,
        mass = amsq + bmsq,
        am = bmsq / mass,
        bm = amsq / mass,
        avx = a.lx - a.x,
        avy = a.ly - a.y,
        avm = Math.mag(avx, avy),
        bvx = b.lx - b.x,
        bvy = b.ly - b.y,
        bvm = Math.mag(bvx, bvy),
        fric = Math.abs(c.distance) * (avm + bvm > 50 ? 0.1 : a.friction * b.friction);
        // fric = Math.abs(c.distance) * (avm + bvm > 10 ? 0.99 : a.friction * b.friction);

      // if (avm + bvm < 30) {
      //   lambx *= 0.1;
      //   lamby *= 0.1;
      // }

      if (avm != 0) {
        avx = (avx / avm) * (avm - fric);
        avy = (avy / avm) * (avm - fric);
      }
      if (bvm != 0) {
        bvx = bvx / bvm * (bvm - fric);
        bvy = bvy / bvm * (bvm - fric);
      }

      if (a.isStatic) {
        am = 0;
        bm = 1;
      } else if (b.isStatic) {
        am = 1;
        bm = 0;
      }

      var solve = true;
      if (a.isTrigger) {
        a.call('collision', b, c);
        solve = false;
      }
      if (b.isTrigger) {
        b.call('collision', a, c);
        solve = false;
      }
      if (solve) {
        a.lastPosition[0] = a.lx = a.position[0] + avx;
        a.lastPosition[1] = a.ly = a.position[1] + avy;
        a.position[0] += lambx * am; a.x = a.position[0];
        a.position[1] += lamby * am; a.y = a.position[1];

        b.lastPosition[0] = b.lx = b.position[0] + bvx;
        b.lastPosition[1] = b.ly = b.position[1] + bvy;
        b.position[0] -= lambx * bm; b.x = b.position[0];
        b.position[1] -= lamby * bm; b.y = b.position[1];
      }
    }
  },
  {
    isStatic: {
      get: function() {
        return !!(this.mask & Particle.Masks.STATIC);
      },
      set: function(value) {
        if (value) {
          this.mask |= Particle.Masks.STATIC;
        } else {
          this.mask = 
            (this.mask | Particle.Masks.STATIC) ^ 
            Particle.Masks.STATIC;
        }
      }
    },
    isTrigger: {
      get: function() {
        return !!(this.mask & Particle.Masks.TRIGGER);
      },
      set: function(value) {
        if (value) {
          this.mask |= Particle.Masks.TRIGGER;
        } else {
          this.mask = 
            (this.mask | Particle.Masks.TRIGGER) ^ 
            Particle.Masks.TRIGGER;
        }
      }
    }
  },
  {
    Masks: {
      LIQUID: 1 << 0,
      SOLID: 1 << 1,
      GAS: 1 << 2,
      STATIC: 1 << 3,
      TRIGGER: 1 << 4,
      ALL: ~0
    }
  }
);

var Box = aqua.type(aqua.type.Base,
  {
    init: function(t, r, b, l) {
      this.top = t;
      this.right = r;
      this.bottom = b;
      this.left = l;
      
      this.width = r - l;
      this.height = t - b;
    },
    contains: function(vec) {
      return vec[0] < this.right &&
        vec[0] > this.left &&
        vec[1] < this.top &&
        vec[1] > this.bottom;
    },
    copy: function() {
      return Box.create(this.top, this.right, this.bottom, this.left);
    },
    translate: function(x, y) {
      this.top += y;
      this.bottom += y;
      
      this.left += x;
      this.right += x;
    }
  }
);

function hashId(hash, x, y) {
  return x+y*hash.cellsWide;
}

var SpatialHash = aqua.type(aqua.type.Base,
  {
    init: function(box, world /*box*/) {
      this.hash = {};
      this.arrayHash = [];
      this.box = box;
      this.newBox = world.copy();
      this.lastBox = world.copy();
    
      this.cellsWide = Math.ceil(world.width / box.width);
      this.cellsTall = Math.ceil(world.height / box.height);
    
      for ( var i = 0; i < this.cellsWide; i++ ) {
        for ( var j = 0; j < this.cellsTall; j++ ) {
          this.arrayHash[ hashId( this, i, j ) ] = [];
        }
      }
    },
    each: function(f) {
      var i;
      for ( i = 0; i < this.arrayHash.length; i++ ) {
        if (this.arrayHash[i])
          f( this.arrayHash[i], Math.floor(i / this.cellsWide), i % this.cellsWide );
      }
    },
    cell: function(x, y) {
      return this.arrayHash[hashId(this, 
        Math.floor((x - this.lastBox.left) / this.box.width),
        Math.floor((y - this.lastBox.bottom) / this.box.height))];
    },
    add: function(p) {
      var px = p.x,
          py = p.y,
          pr = p.radius,
          cellWidth = this.box.width,
          cellHeight = this.box.height,
          cellsWide = this.cellsWide,
          cellsTall = this.cellsTall,
          newBox = this.newBox,
          maxI = Math.floor((px + pr - newBox.left) / cellWidth + 1),
          maxJ = Math.floor((py + pr - newBox.bottom) / cellHeight + 1),
          i, j;
      for (i = Math.floor((px - pr - newBox.left) / cellWidth); 
        i >= 0 && i < cellsWide && i < maxI; 
        i++
      ) {
        for (j = Math.floor((py - pr - newBox.bottom) / cellHeight);
          j >= 0 && j < cellsTall && j < maxJ;
          j++
        ) {
          var id = hashId(this, i, j),
              cell = this.arrayHash[id];
          cell.push(p);
        }
      }
      
      p.oldX = p.x;
      p.oldY = p.y;
      // vec3.set(p.position, p.oldPosition);
    },
    remove: function(p) {
      var px = p.oldX,
          py = p.oldY,
          pr = p.radius,
          cellWidth = this.box.width,
          cellHeight = this.box.height,
          cellsWide = this.cellsWide,
          cellsTall = this.cellsTall,
          lastBox = this.lastBox,
          maxI = Math.floor((px + pr - lastBox.left) / cellWidth + 1),
          maxJ = Math.floor((py + pr - lastBox.bottom) / cellHeight + 1),
          i, j;
      for (i = Math.floor((px - pr - lastBox.left) / cellWidth); 
        i >= 0 && i < cellsWide && i < maxI; 
        i++
      ) {
        for (j = Math.floor((py - pr - lastBox.bottom) / cellHeight);
          j >= 0 && j < cellsTall && j < maxJ;
          j++
        ) {
          var id = hashId(this, i, j),
              cell = this.arrayHash[id],
              index = cell.indexOf( p );
          cell[ index ] = cell[ cell.length - 1 ];
          cell.pop();
          // cell.splice(cell.indexOf(p), 1);
        }
      }
    },
    update: function(p) {
      // if (p.x == p.oldPosition[0] && p.y == p.oldPosition[1]) return;
      this.remove(p);
      this.add(p);
    }
  },
  {},
  {}
);

var World = aqua.type(aqua.GameObject,
  {
    init: function(box) {
      Object.getPrototypeOf(Object.getPrototypeOf(this)).init.call(this);
      
      this.particles = [];
      this.collision = {};
      this.box = box;
      this.gravity = [0, 0, 0];
      
      this.fixedDelta = 1 / 50;
      this.timeToPlay = 0;
      
      box = box.copy();
      box.left -= 50;
      box.right += 50;
      box.top += 50;
      box.bottom -= 50;
      this.hash = SpatialHash.create(Box.create(50, 50, 0, 0), box);
      
      // this.buffer = ctx.buffer();
    },
    ongameadd: function(game) {
      this.task = game.task(this.update.bind(this), aqua.Game.Priorities.LATE_UPDATE);
    },
    ongamedestroy: function(game) {
      game.tasks.remove(this.task);
    },
    addParticle: function(particle) {
      this.particles.push(particle);
      this.hash.add(particle);
      particle.index = this.particles.length - 1;
    },
    removeParticle: function(particle) {
      this.game.task((function(){
        var index = this.particles.indexOf(particle);
        if (index != -1) {
          this.particles[ index ] = this.particles[ this.particles.length - 1 ];
          this.particles[ index ].index = index;

          this.particles.pop();

          this.hash.remove(particle);
        }
      }).bind(this), aqua.Game.Priorities.GARBAGE, false, true);
    },
    update: function() {
      var fixedDelta = this.fixedDelta;
      
      this.game.timing.fixedDelta = fixedDelta;
      this.timeToPlay += this.game.timing.delta;
      
      while (this.timeToPlay > 1 / 50) {
        this.timeToPlay -= 1 / 50;
        
        this.game.call('fixedUpdate', this);
        
        this.step(fixedDelta);
      }
    },
    step: function(dt) {
      var particles = this.particles,
          collision = this.collision, 
          box = this.box,
          count = particles.length, i, j, p, q;

      collision.test = 0;
      collision.collided = 0;

      for ( i = 0; i < count; i++ ) {
        p = particles[i];

        vec3.add(p.acceleration, this.gravity, p.acceleration);

        p.integrate(dt);
      }
      
      var cellCount = 0, updateList = [], hash = this.hash;
      this.hash.each(function(cell) {
        cellCount = cell.length;
        updateList.splice(0, updateList.length);
        
        for ( i = 0; i < cellCount; i++ ) {
          p = cell[i];
          for ( j = i + 1; j < cellCount; j++ ) {
            q = cell[j];
            if (p.test(q, collision)) {
              p.solve(q, collision);
              
              if (updateList.indexOf(p) == -1)
                updateList.push(p);
              if (updateList.indexOf(q) == -1)
                updateList.push(q);
            }
          }
        }
        
        for ( i = 0; i < updateList.length; i++ ) {
          hash.update(updateList[i]);
        }
      });
      
      // this.box.translate(1,0);
      this.hash.newBox = this.box.copy();
      
      for ( i = 0; i < count; i++ ) {
        p = particles[i];
        
        if (p.position[0] < box.left) {
          var vx = p.position[0] - p.lastPosition[0];
          p.position[0] = box.right;
          p.lastPosition[0] = p.position[0] - vx;
          // p.position[1] = box.height * Math.random();

          // p.lastPosition[1] = p.position[1];
        }
        if (p.position[0] > box.right) {
          var vx = p.position[0] - p.lastPosition[0];
          p.position[0] = box.left;
          p.lastPosition[0] = p.position[0] - vx;
        }
        if (p.position[1] > box.top) {
          var vy = p.position[1] - p.lastPosition[1];
          p.position[1] = box.bottom;
          p.lastPosition[1] = p.position[1] - vy;
        }
        if (p.position[1] < box.bottom) {
          var vy = p.position[1] - p.lastPosition[1];
          p.position[1] = box.top;
          p.lastPosition[1] = p.position[1] - vy;
        }
        
        this.hash.update(p);
        
        // if (p.position[0] == NaN || p.position[1] == NaN) {
        //   vec3.set([this.box.right-p.radius,this.box.bottom+p.radius,0], p.position);
        //   vec3.set(p.position, p.lastPosition);
        // }
      }
      
      this.hash.lastBox = this.box.copy();
    }
  }
);

var PaperRenderer = aqua.type(aqua.Component,
  {
    onadd: function(gameObject) {
      this.world = gameObject;
      if (!this.paths) {
        this.paths = [];
      }
    },
    lateUpdate: function() {
      var i, path, particle;

      for (i = this.paths.length; i < this.world.particles.length; i++) {
        path = new paper.Path.Circle(new paper.Point(0, 0), 1);
        path.fillColor = 'red';
        path.currentSize = 1;
        this.paths.push(path);
      }
      for (i = this.paths.length; i > this.world.particles.length; i--) {
        this.paths.pop().remove();
      }

      for (i = 0; i < this.world.particles.length; i++) {
        path = this.paths[i];
        particle = this.world.particles[i];
        path.scale(particle.radius / path.currentSize);
        path.currentSize = particle.radius;
        path.translate(new paper.Point(particle.position[0]-path.position.x, particle.position[1]-path.position.y));
      }
    }
  }
);

aqua.Particle = Particle;
aqua.World = World;
aqua.World.PaperRenderer = PaperRenderer;
aqua.Box = Box;

});
})(this, this.load);
