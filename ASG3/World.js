// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    'v_UV = a_UV;\n' +
    '}\n';

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;  // uniform変数
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    void main(){
    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
    } else if(u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0){
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1){
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else{
        gl_FragColor = vec4(1,.2,.2,1);
    }
}`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let camera;
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

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
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

    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    if (!u_ViewMatrix) {
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get u_ProjectionMatrix');
        return;
    }
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals related UI elements
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = true;
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

function initTextures() {
    var image = new Image(); //Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }

    //Register the event handler to be called on loading an image
    image.onload = function () { sendTextureToGLSL(image); };
    //Tell the browser to load an image
    image.src = 'ground.jpg';

    var sky = new Image();
    if (!sky) {
        console.log('Failed to create the image object');
        return false;
    }
    sky.onload = function () { sendTextureToGLSL1(sky); };
    sky.src = 'sky_cloud.jpg';
    return true;
}

function sendTextureToGLSL(image) {
    var texture = gl.createTexture(); //create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  //Flip the image's y axis
    //Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    //Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    //set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    console.log('finished loadTexture');
}

function sendTextureToGLSL1(image) {
    var texture = gl.createTexture(); //create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  //Flip the image's y axis
    //Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    //Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    //set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);

    console.log('finished loadTexture');
}

var currentAngle = [0.0, 0.0];
function main() {

    //Seet up canvas and gl variables
    setupWebGL();
    //Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    //Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    camera = new Camera();
    document.onkeydown = keydown; //key control

    initTextures();
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
            camera.panMLeft((lastX - x));
            camera.panMRight((lastY - y));
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

    //update animation angles
    updateAnimationAngles();

    //Draw everything
    renderAllShapes();

    //Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_yellowAnimation == true) {
        g_yellowAngle = (12 * Math.sin(g_seconds));
        g_headAngle = (5 * Math.sin(g_seconds));
    }
    if (shift == true) {
        g_yellowAngle2 = (20 * Math.sin(g_seconds));
        g_headAngle2 = (100 * Math.sin(g_seconds));
    }
}
function keydown(ev) {
    if (ev.keyCode == 65) { // D
        camera.moveRight();
    } else if (ev.keyCode == 68) { //  A
        camera.moveLeft();
    } else if (ev.keyCode == 87) { //  W
        camera.moveForward();
    } else if (ev.keyCode == 83) { //  S
        camera.moveBackwards();
    } else if (ev.keyCode == 81) { // Q
        camera.panLeft();
    } else if (ev.keyCode == 69) { // E
        camera.panRight();
    }
    renderAllShapes();
}

function renderAllShapes() {

    //check the time at the start of this function
    var startTime = performance.now();

    var projMat = camera.projMat;

    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = camera.viewMat;

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

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

var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,],
    [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,],
    [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1,],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,],
];
var x;
var y;
var i;
function drawMap() {
    for (i = 0; i < 2; i++) {
        for (x = 0; x < 32; x++) {
            for (y = 0; y < 32; y++) {
                if (i == 0) {
                    if (g_map[x][y] == 1) {
                        var body = new Cube();
                        body.color = [0.4, 1, 0.4, 1];
                        body.matrix.translate(x - 15, -0.545, y - 15);
                        body.renderfast();
                    }
                } else if (i == 1) {
                    if (g_map[x][y] == 1) {
                        var body = new Cube();
                        body.color = [0.5, 0.2, 1, 1];
                        body.matrix.translate(x - 15, 0.545, y - 15);
                        body.renderfast();
                    }
                }
            }
        }
    }
}

function renderScene() {
    var bodycolor = [0.41, 0.29, 0.96, 1];
    var feetcolor = [0.5, 0.5, 0.5, 1];
    var headcolor = [181 / 255, 156 / 255, 135 / 255, 1];
    var Thighcolor = [239 / 255, 224 / 255, 187 / 255, 1];
    var tailcolor = [120 / 255, 74 / 255, 66 / 255, 1];
    var horncolor = [40 / 255, 189 / 255, 158 / 255, 1]

    //map
    drawMap();

    //ground
    var ground = new Cube();
    ground.color = [1, 0, 0, 1];
    ground.textureNum = 0;
    ground.matrix.translate(-15, -0.35, -15);
    ground.matrix.scale(32, 0, 32);
    ground.render();

    //sky
    var sky = new Cube();
    sky.color = [135 / 255, 206 / 255, 235 / 255, 1];
    sky.textureNum = 1;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

    //body
    var body = new Cube();
    body.color = bodycolor;
    //body.textureNum = -1;        //image color
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


