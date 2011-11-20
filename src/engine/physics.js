(function(window, load) {
load.module('engine/physics.js', load.script('engine/math.js'), function() {

var Particle = aqua.type(aqua.Emitter,
  {
    init: function(position, radius, density) {
      this.position = (position).slice();
      this.lastPosition = (position).slice();
      this.oldPosition = (position).slice();
      this.acceleration = ([0,0,0]);
      
      this.temporaryPosition = (position).slice();
      
      this.radius = radius;
      this.mass = density * radius * radius;
      
      this.mask = Particle.Masks.LIQUID;
      this.collisionMask = Particle.Masks.ALL;
      
      this.friction = friction;
    },
    integrate: function(dt) {
      if (this.isStatic) {
        return;
      }
      
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
      
      this.x = this.position[0];
      this.y = this.position[1];
      this.lx = this.lastPosition[0];
      this.ly = this.lastPosition[1];
      
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
            al = Math.mag(lx, ly),
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
        amsq = Math.pow(a.mass, 1),
        bmsq = Math.pow(b.mass, 1),
        mass = amsq + bmsq,
        am = bmsq / mass,
        bm = amsq / mass,
        avx = a.lx - a.x,
        avy = a.ly - a.y,
        avm = Math.mag(avx, avy),
        bvx = b.lx - b.x,
        bvy = b.ly - b.y,
        bvm = Math.mag(bvx, bvy),
        fric = Math.abs(c.distance) * (avm + bvm > 10 ? 0.1 : a.friction * b.friction);
        // fric = Math.abs(c.distance) * (avm + bvm > 10 ? 0.99 : a.friction * b.friction);

      avx = (avx / avm) * (avm - fric);
      avy = (avy / avm) * (avm - fric);
      bvx = bvx / bvm * (bvm - fric);
      bvy = bvy / bvm * (bvm - fric);

      if (a.isStatic) {
        am = 0;
        bm = 1;
      } else if (b.isStatic) {
        am = 1;
        bm = 0;
      }

      if (a.istrigger) {
        a.call('collision', b, c);
      } else if (b.istrigger) {
        b.call('collision', a, c);
      } else {
        a.lastPosition[0] = a.lx = a.position[0] + avx;
        a.lastPosition[1] = a.ly = a.position[1] + avy;
        a.position[0] += lambx * am; a.x = a.position[0];
        a.position[1] += lamby * am; a.y = a.position[1];

        b.lastPosition[0] = b.lx = b.position[0] + bvx;
        b.lastPosition[1] = b.ly = b.position[1] + bvy;
        b.position[0] -= lambx * bm; b.x = b.position[0];
        b.position[1] -= lamby * bm; b.y = b.position[1];
      }
    },
    draw: function(ctx, gl, buffer) {
      var x = this.position[0], y = this.position[1], r = this.radius;
      
      buffer.load(Graphics.array(
        4,
        
        Graphics.ValueType.Vertex,
        3,
        [x-r, y-r, 0, x+r, y-r, 0, x-r, y+r, 0, x+r, y+r, 0],
        Graphics.Type.Float32,
        
        Graphics.ValueType.Color,
        4,
        [0,0,255,255, 0,0,255,255, 0,0,255,255, 0,0,255,255],
        Graphics.Type.UnsignedByte
      )).bind().triangleStrip();
    },
    getDrawArray: function() {
      var x = this.position[0], y = this.position[1], r = this.radius;
      
      return Graphics.array(
        6,
        
        Graphics.ValueType.Vertex,
        3,
        [x-r, y-r, 0, x+r, y-r, 0, x-r, y+r, 0, x+r, y-r, 0, x-r, y+r, 0, x+r, y+r, 0],
        Graphics.Type.Float32,
        
        Graphics.ValueType.Color,
        4,
        [0,0,255,255, 0,0,255,255, 0,0,255,255, 0,0,255,255, 0,0,255,255, 0,0,255,255],
        Graphics.Type.UnsignedByte
      );
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
    }
  }
);

function hashId(hash, x, y) {
  return x+y*hash.cellsWide;
}

var SpatialHash = aqua.type(aqua.type.Base,
  {
    init: function(box,world) {
      this.hash = {};
      this.arrayHash = [];
      this.box = box;
      this.newBox = world;
      this.lastBox = world.copy();
      
      this.cellsWide = Math.ceil(world.width / box.width);
      this.cellsTall = Math.ceil(world.height / box.height);
    },
    each: function(f) {
      var i;
      for ( i = 0; i < this.arrayHash.length; i++ ) {
        if (this.arrayHash[i])
          f( this.arrayHash[i], Math.floor(i / this.cellsWide), i % this.cellsWide );
      }
    },
    add: function(p) {
      var px = p.position[0],
          py = p.position[1],
          pr = p.radius,
          cellWidth = this.box.width,
          cellHeight = this.box.height,
          cellsWide = this.cellsWide,
          cellsTall = this.cellsTall,
          newBox = this.newBox,
          i, j;
      for (i = parseInt((px - pr - newBox.left) / cellWidth); 
        i >= 0 && i < cellsWide && i < parseInt((px + pr - newBox.left) / cellWidth + 1); 
        i++
      ) {
        for (j = parseInt((py - pr - newBox.bottom) / cellHeight);
          j >= 0 && j < cellsTall && j < parseInt((py + pr - newBox.bottom) / cellHeight + 1);
          j++
        ) {
          var id = hashId(this, i, j),
              cell = this.arrayHash[id];
          if (!cell) this.arrayHash[id] = cell = [];
          cell.push(p);
        }
      }
      
      vec3.set(p.position, p.oldPosition);
    },
    remove: function(p) {
      var px = p.oldPosition[0],
          py = p.oldPosition[1],
          pr = p.radius,
          cellWidth = this.box.width,
          cellHeight = this.box.height,
          cellsWide = this.cellsWide,
          cellsTall = this.cellsTall,
          lastBox = this.lastBox,
          i, j;
      for (i = parseInt((px - pr - lastBox.left) / cellWidth); 
        i >= 0 && i < cellsWide && i < parseInt((px + pr - lastBox.left) / cellWidth + 1); 
        i++
      ) {
        for (j = parseInt((py - pr - lastBox.bottom) / cellHeight);
          j >= 0 && j < cellsTall && j < parseInt((py + pr - lastBox.bottom) / cellHeight + 1);
          j++
        ) {
          var id = hashId(this, i, j),
              cell = this.arrayHash[id];
          if (!cell) this.arrayHash[id] = cell = [];
          cell.splice(cell.indexOf(p), 1);
        }
      }
    },
    update: function(p) {
      if (p.position[0] == p.oldPosition[0] && p.position[1] == p.oldPosition[1]) return;
      this.remove(p);
      this.add(p);
    }
  },
  {},
  {}
);

var World = aqua.type(aqua.type.Base,
  {
    init: function(box) {
      this.particles = [];
      this.collision = {};
      this.box = box;
      this.gravity = [0, 0, 0];
      
      this.hash = SpatialHash.create(Box.create(20, 20, 0, 0), box);
      
      this.buffer = ctx.buffer();
    },
    addParticle: function(particle) {
      this.particles.push(particle);
      this.hash.add(particle);
    },
    removeParticle: function(particle) {
      
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
      
      for ( i = 0; i < count; i++ ) {
        p = particles[i];
        
        if (p.position[0] - p.radius < box.left) {
          p.position[0] = box.left + p.radius;
        }
        if (p.position[0] + p.radius > box.right) {
          p.position[0] = box.right - p.radius;
        }
        if (p.position[1] + p.radius > box.top) {
          p.position[1] = box.top - p.radius;
        }
        if (p.position[1] - p.radius < box.bottom) {
          p.position[1] = box.bottom + p.radius;
        }
        
        this.hash.update(p);
      }
    },
    draw: function(ctx, gl) {
      var particles = this.particles,
          buffer = this.buffer,
          count = particles.length,
          i;

      // for ( i = 0; i < count; i++ ) {
      //   particles[i].draw(ctx, gl, buffer);
      // }
      this.drawWater(ctx, gl);
    },
    drawWater: function(ctx, gl) {
      var arrayBuffer = Graphics.array(this.particles.length * 6,
            Graphics.ValueType.Vertex,
            3,
            null,
            Graphics.Type.Float32,
            
            Graphics.ValueType.Color,
            4,
            null,
            Graphics.Type.UnsignedByte),
          floatView = new Float32Array(arrayBuffer),
          byteView = new Uint8Array(arrayBuffer),
          particles = this.particles,
          p,
          buffer = this.buffer,
          count = particles.length,
          i,
          j,
          offset = 0, // in bytes
          particleArray,
          x, y, r,
          lx, ly;
      
      // var x = this.position[0], y = this.position[1], r = this.radius;
      // 
      // return Graphics.array(
      //   6,
      // 
      //   Graphics.ValueType.Vertex,
      //   3,
      //   [x-r, y-r, 0, x+r, y-r, 0, x-r, y+r, 0, x+r, y-r, 0, x-r, y+r, 0, x+r, y+r, 0],
      //   Graphics.Type.Float32,
      // 
      //   Graphics.ValueType.Color,
      //   4,
      //   [0,0,255,255, 0,0,255,255, 0,0,255,255, 0,0,255,255, 0,0,255,255, 0,0,255,255],
      //   Graphics.Type.UnsignedByte
      // );
      
      for ( i = 0; i < count; i++ ) {
        p = particles[i];
        x = p.x, y = p.y, r = p.radius;
        
        for ( j = 0; j < 24; j++ ) {
          if (j % 4 == 0) {
            floatView[offset + j] = x + (j % 8 > 3 ? 1 : -1) * r;
          } else if (j % 4 == 1) {
            floatView[offset + j] = y + (((j - 1) / 4 == 2 || (j - 1) / 4 == 4 || (j - 1) / 4 == 5) ? 1 : -1) * r;
          }
        }
        
        offset += 24;
      }
      
      count *= 6 * 16;
      for ( i = 0; i < count; i++ ) {
        if ( i % 16 > 13 )
          byteView[i] = 255;
        else if (i % 16 > 11) {
          p = particles[Math.floor(i/96)];
          x = p.x, y = p.y, lx = p.lx, ly = p.ly;
          byteView[i] = Math.clamp((Math.mag(x-lx,y-ly,2)) / 10 * 255, 0, 255);
        }
      }
      
      buffer.load(arrayBuffer).bind().triangles();
    }
  }
);

aqua.Particle = Particle;
aqua.World = World;

});
})(this, this.load);