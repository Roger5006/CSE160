function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('asg0');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }

  ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);
}

function drawVector(v, color) {
  ctx.strokeStyle = color; // Set color
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20, 20 * v.elements[2]);
  ctx.stroke();
}

function handleDrawEvent() {
  // Clear Canvas
  ctx.clearRect(0, 0, 400, 400);

  // Black blackground
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  //read input
  let x = document.getElementById('v1x').value;
  let y = document.getElementById('v1y').value;
  let x2 = document.getElementById('v2x').value;
  let y2 = document.getElementById('v2y').value;

  // Draw new lines
  let v1 = new Vector3([x, y, 0.0]);
  drawVector(v1, "red");
  let v2 = new Vector3([x2, y2, 0.0]);
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  let x = document.getElementById('v1x').value;
  let y = document.getElementById('v1y').value;
  let x2 = document.getElementById('v2x').value;
  let y2 = document.getElementById('v2y').value;

  // Clear Canvas
  ctx.clearRect(0, 0, 400, 400);

  // Black blackground
  ctx.fillStyle = 'black'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);

  // Draw lines
  let v1 = new Vector3([x, y, 0.0]);
  drawVector(v1, "red");
  let v2 = new Vector3([x2, y2, 0.0]);
  drawVector(v2, "red");

  let operator = document.getElementById('operation_selection').value;
  if (operator == "Add") {
    v1.add(v2);
    drawVector(v1, "green");
  } else if (operator == "Subtract") {
    v1.sub(v2);
    drawVector(v1, "green");
  } else if (operator == "Multiply") {
    let s = document.getElementById('scalar').value;
    v1.mul(s);
    drawVector(v1, "green");
    v2.mul(s);
    drawVector(v2, "green");
  } else if (operator == "Divide") {
    let s = document.getElementById('scalar').value;
    v1.div(s);
    drawVector(v1, "green");
    v2.div(s);
    drawVector(v2, "green");
  } else if (operator == "Mag") {
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  } else if (operator == "Norm") {
    let v1_norm = v1.normalize();
    drawVector(v1_norm, "green");
    let v2_norm = v2.normalize();
    drawVector(v2_norm, "green");
  } else if (operator == "Angle") {
    console.log("Angle: " + (angleBetween(v1, v2)));
  } else if (operator == "Area") {
    console.log("Area of this triangle: " + (areaTriangle(v1, v2)));
  }
}

function angleBetween(v1, v2) {
  var m1 = v1.magnitude();
  var m2 = v2.magnitude();
  var d = Vector3.dot(v1, v2);
  var alpha = Math.acos(d / (m1 * m2)); // Radians
  alpha *= 180 / Math.PI;
  return alpha;
}

function areaTriangle(v1, v2) {
  var area = Vector3.cross(v1, v2);
  var v1 = new Vector3([area[0], area[1], area[2]]);
  var result = v1.magnitude() / 2;
  return result;
}