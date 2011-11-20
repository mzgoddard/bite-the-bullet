uniform mat4 modelview_projection;

attribute vec2 a_position;
attribute vec2 a_texcoord0;

varying highp vec2 v_texcoord0;

void main() {
  gl_Position = modelview_projection * vec4(a_position, 0, 1);
  
  v_texcoord0 = a_texcoord0;
}