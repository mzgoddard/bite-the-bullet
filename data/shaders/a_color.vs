uniform mat4 modelview_projection;

attribute vec2 a_position;
attribute lowp vec4 a_color;

varying lowp vec4 v_color;

void main() {
  gl_Position = modelview_projection * vec4(a_position, 0, 1);
  
  v_color = a_color;
}