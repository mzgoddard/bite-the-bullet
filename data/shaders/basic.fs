uniform lowp sampler2D texture0;
uniform lowp vec4 color;

varying highp vec2 v_texcoord0;

void main() {
  // gl_FragColor = texture2D(texture0, v_texcoord0.st) * color;
  gl_FragColor = color;
  // gl_FragColor = rgba(255,255,255,255);
}