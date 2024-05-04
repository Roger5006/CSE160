// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  //Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_headAngle = 0;
let shift = false;


//Set up action for the HTML UI elements
function addActionsForHtmlUI() {

  document.getElementById('animationYellowOffButton').onclick = function () { g_yellowAnimation = false; };
  document.getElementById('animationYellowOnButton').onclick = function () { g_yellowAnimation = true; };

  //slider Events
  document.getElementById('yellowSlide').addEventListener('mousemove', function () { g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById('magentaSlide').addEventListener('mousemove', function () { g_magentaAngle = this.value; renderAllShapes(); });
  document.getElementById('headSlide').addEventListener('mousemove', function () { g_headAngle = this.value; renderAllShapes(); });

  //Size Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
}
var currentAngle = [0.0, 0.0];
function main() {

  //Seet up canvas and gl variables
  setupWebGL();
  //Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  //Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press

  initEventHandlers(canvas, currentAngle);
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

function initEventHandlers(canvas, currentAngle) {
  var dragging = false;
  var lastX = -1, lastY = -1;
  canvas.onmousedown = function (ev) {
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };
  canvas.onmouseup = function (ev) { dragging = false; };
  canvas.onmousemove = function (ev) {
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 100 / canvas.height;
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  //save the current time
  //print some debug information so we know we are running
  g_seconds = performance.now() / 1000.0 - g_startTime;
  //console.log(g_seconds);

  //update animation angles
  updateAnimationAngles();

  //Draw everything
  renderAllShapes();

  //Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_yellowAnimation == true) {
    g_yellowAngle = (30 * Math.sin(g_seconds));
    g_headAngle = (15 * Math.sin(g_seconds));
  }
  if (shift == true) {
    g_yellowAngle2 = (20 * Math.sin(g_seconds));
    g_headAngle2 = (100 * Math.sin(g_seconds));
  }
}
function renderAllShapes() {

  //check the time at the start of this function
  var startTime = performance.now();

  //Pass the matrix to u_ModelMatrix attribute
  //var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);

  var globalRotMat = new Matrix4().rotate(currentAngle[0], 1.0, 0.0, 0.0);
  globalRotMat.rotate(currentAngle[1], 0.0, 1.0, 0.0);
  globalRotMat.rotate(g_globalAngle, 0.0, 1.0, 0.0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  renderScene();
  var duration = performance.now() - startTime;
  sendTextToHTML("ms:" + Math.floor(duration) + "fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function renderScene() {
  var bodycolor = [0.17, 0.22, 0.26, 1];
  var feetcolor = [0.5, 1, 0.5, 1];
  var headcolor = [181 / 255, 101 / 255, 29 / 255, 1];
  var Thighcolor = [239 / 255, 224 / 255, 187 / 255, 1];
  var tailcolor = [120 / 255, 74 / 255, 66 / 255, 1];
  var horncolor = [240 / 255, 189 / 255, 158 / 255, 1]

  //body
  var body = new Cube();
  body.color = bodycolor;
  body.matrix.translate(-.5, 0, -0.25);
  //body.matrix.rotate(-5,1,0,0)
  body.matrix.scale(0.7, 0.4, 0.4);
  body.render();

  //front left leg大腿
  var frontleft = new Cube();
  frontleft.color = Thighcolor; //grey
  //frontleft.matrix.rotate(180,0,0,1);
  frontleft.matrix.translate(-.4, -0.19, -0.2);
  frontleft.matrix.scale(0.15, 0.25, 0.09);
  if (shift == true) {
    frontleft.matrix.rotate(g_yellowAngle2, 1, 0, 0);
  } else {
    frontleft.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  }
  var frontleftcoordinate = new Matrix4(frontleft.matrix);
  frontleft.render();

  //front left foot小腿
  var frontleftft = new Cube();
  frontleftft.color = Thighcolor;
  frontleftft.matrix = frontleftcoordinate;
  frontleftft.matrix.translate(0.25, -0.45, 0.25);
  frontleftft.matrix.scale(0.5, 0.6, 0.5);
  frontleftft.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var frontleftftcoordinate = new Matrix4(frontleftft.matrix);
  frontleftft.render();

  //front left ft 脚
  var frontleftfoot = new Cube();
  frontleftfoot.color = feetcolor;
  frontleftfoot.matrix = frontleftftcoordinate;
  frontleftfoot.matrix.translate(-0.2, -0.2, -0.7);
  frontleftfoot.matrix.scale(1.5, 0.2, 2.5);
  frontleftfoot.render();

  //front right leg 大腿
  var frontright = new Cube();
  frontright.color = Thighcolor;
  //frontright.matrix.scale(0.15,0.25,0.09);
  frontright.matrix.translate(-.4, -0.19, 0);
  frontright.matrix.scale(0.15, 0.25, 0.09);
  if (shift == true) {
    frontright.matrix.rotate(-g_yellowAngle2, 1, 0, 0);
  } else {
    frontright.matrix.rotate(g_yellowAngle, 0, 0, 1);
  }
  var frontrightcoordinate = new Matrix4(frontright.matrix);
  frontright.render();

  //front right foot小腿
  var frontrightft = new Cube();
  frontrightft.color = Thighcolor;
  frontrightft.matrix = frontrightcoordinate;
  frontrightft.matrix.translate(0.25, -0.45, 0.25);
  frontrightft.matrix.scale(0.5, 0.6, 0.5);
  frontrightft.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var frontrightftcoordinate = new Matrix4(frontrightft.matrix);
  frontrightft.render();

  //front right 脚
  var frontrightfoot = new Cube();
  frontrightfoot.color = feetcolor;
  frontrightfoot.matrix = frontrightftcoordinate;
  frontrightfoot.matrix.translate(-0.2, -0.2, -0.75);
  frontrightfoot.matrix.scale(1.5, 0.2, 2.5);
  frontrightfoot.render();

  //back left Thigh 大腿
  var backleftT = new Cube();
  backleftT.color = Thighcolor;
  //frontleft.matrix.rotate(180,0,0,1);
  backleftT.matrix.translate(-0.02, -0.19, -0.2);
  backleftT.matrix.scale(0.15, 0.25, 0.09);
  if (shift == true) {
    backleftT.matrix.rotate(g_yellowAngle2, 1, 0, 0);
  } else {
    backleftT.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  }
  var backleftTCoord = new Matrix4(backleftT.matrix);
  backleftT.render();

  //back left Lower Leg小腿
  var backleftLL = new Cube();
  backleftLL.color = Thighcolor;
  backleftLL.matrix = backleftTCoord;
  backleftLL.matrix.translate(0.25, -0.45, 0.25);
  backleftLL.matrix.scale(0.5, 0.6, 0.5);
  backleftLL.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var backleftLLCoord = new Matrix4(backleftLL.matrix);
  backleftLL.render();

  //back left feet 脚
  var backleftft = new Cube();
  backleftft.color = feetcolor;
  backleftft.matrix = backleftLLCoord;
  backleftft.matrix.translate(-0.25, -0.2, -0.7);
  backleftft.matrix.scale(1.5, 0.2, 2.5);
  backleftft.render();

  //back right Thigh 大腿
  var backrightT = new Cube();
  backrightT.color = Thighcolor;
  backrightT.matrix.translate(-0.02, -0.19, 0);
  backrightT.matrix.scale(0.15, 0.25, 0.09);
  if (shift == true) {
    backrightT.matrix.rotate(-g_yellowAngle2, 1, 0, 0);
  } else {
    backrightT.matrix.rotate(g_yellowAngle, 0, 0, 1);
  }
  var backrightTCoord = new Matrix4(backrightT.matrix);
  backrightT.render();

  //back right Lower Leg
  var backrightLL = new Cube();
  backrightLL.color = Thighcolor;
  backrightLL.matrix = backrightTCoord;
  backrightLL.matrix.translate(0.25, -0.45, 0.25);
  backrightLL.matrix.scale(0.5, 0.6, 0.5);
  backrightLL.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var backrightLLCoord = new Matrix4(backrightLL.matrix);
  backrightLL.render();

  //back right feet
  var backrightft = new Cube();
  backrightft.color = feetcolor;
  backrightft.matrix = backrightLLCoord;
  backrightft.matrix.translate(-0.25, -0.2, -0.7);
  backrightft.matrix.scale(1.5, 0.2, 2.5);
  backrightft.render();

  //Head
  var head = new Cube();
  head.color = headcolor;
  head.matrix.translate(0.15, 0, -.2);
  head.matrix.scale(0.35, 0.3, 0.3);
  if (shift == true) {
    head.matrix.rotate(g_headAngle2, 1, 1, 1)
  } else {
    head.matrix.rotate(g_headAngle, 0, 0, 1);
  }
  var headcoord = new Matrix4(head.matrix);
  //head.matrix.rotate(g_headAngle,0,0,1);
  head.render();

  //tail
  var tail = new Cube();
  tail.color = tailcolor;
  tail.matrix.rotate(20, 0, 0, 1);
  tail.matrix.translate(-0.65, 0.3, -0.1);
  tail.matrix.scale(0.3, 0.05, 0.1);
  //tail.matrix.rotate(40, 1, 0 , 0);
  tail.render();

  //left horn
  var lefthorn = new Triangle();
  lefthorn.color = horncolor;
  lefthorn.matrix = headcoord;
  lefthorn.matrix.translate(0.5, 1, 0.2);
  lefthorn.matrix.scale(0.6, 0.3, 0.5);
  lefthorn.render();

  //right horn
  var righthorn = new Triangle();
  righthorn.color = horncolor;
  righthorn.matrix = headcoord;
  righthorn.matrix.translate(0, 0, 0.8);
  //righthorn.matrix.scale(1, 1, 1);
  righthorn.render();
}

function funcShiftKey(event) {
  if (event.shiftKey) {
    shift = true;
  } else {
    shift = false;
  }
}


