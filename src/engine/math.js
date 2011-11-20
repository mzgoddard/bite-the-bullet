(function(window) {
  Math.mag = function(a, b) {
    return Math.sqrt(a * a + b * b);
  };
  Math.lerp = function(a, b, t) {
    return (b - a) * t + a;
  };
  Math.clamp = function(v, a, b) {
    return Math.min(Math.max(v, a), b);
  };
})(this);