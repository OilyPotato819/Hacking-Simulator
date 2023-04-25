// Initialize Canvas
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

cnv.width = 1200;
cnv.height = 800;

// Global Variables
const smallSize = 80;
const bigSize = 300;
const optionSize = 40;
const spacing = 70;
const boxBackground = "rgb(35, 35, 35)";
const green = "rgb(0,200,0)";
let solved = false;
let inputNum = 5;
let outputNum = 2;
let solutionLines = [];
let inputBoxes = [];
let outputBoxes = [];
let goalBoxes = [];
let checkClick = [];
let mouse = {};
let formulas = [];
let inputSolutions = [];

let draw = {
  first: [],
  second: [],
};
let drawInputs = {
  first: [],
  second: [],
};
let drawOutputs = {
  first: [],
  second: [],
};

let bigBox = {
  x: cnv.width / 2 + smallSize + spacing - (smallSize * 3 + spacing * 3 + bigSize) / 2,
  y: cnv.height / 2 - bigSize / 2 - 75,
  size: bigSize,
  color: green,
  draw() {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.size, this.size);
  },
};

let regenerate = {
  x: cnv.width / 2 - 100,
  y: cnv.height - 100,
  w: 200,
  h: 50,
  draw() {
    this.checkClick();

    ctx.fillStyle = boxBackground;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    ctx.fillStyle = "white";
    ctx.font = "30px Inconsolata";
    const metrics = ctx.measureText("Regenerate");
    ctx.fillText("Regenerate", this.x + this.w / 2 - metrics.width / 2, this.y + this.h / 2 + 30 / 4);
  },

  checkClick() {
    if (
      mouse.leftDown &&
      mouse.x > this.x &&
      mouse.x < this.x + this.w &&
      mouse.y > this.y &&
      mouse.y < this.y + this.h
    ) {
      generateFormulas();
      setBoxes();
      solves.solveCount = 0;
      solves.time = 60;
      solves.updateText();
      clearInterval(solves.interval);
      solves.startTimer();
    }
  },
};

let unknown = {
  x: cnv.width / 2 - 350 / 2,
  y: 35,
  w: 350,
  h: 60,
  draw() {
    ctx.fillStyle = boxBackground;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.strokeStyle = green;
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    ctx.fillStyle = green;
    ctx.font = "30px Inconsolata";
    const metrics = ctx.measureText("Unknown Sequence");
    ctx.fillText(
      "Unknown Sequence",
      this.x + this.w / 2 - metrics.width / 2,
      this.y + this.h / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
    );
  },
};

let solves = {
  x: cnv.width - 410,
  y: 562,
  time: 60,
  solveCount: 0,

  draw() {
    ctx.fillStyle = green;
    ctx.font = "50px Inconsolata";
    for (let i = 0; i < this.text.length; i++) {
      ctx.fillText(this.text[i], this.x, this.y + i * 50);
    }
  },

  updateText() {
    ctx.font = "50px Inconsolata";
    this.text = [`(${this.solveCount}/${inputNum}) Values`, `bypassed.`, `Next solve in`, `${this.time} seconds`];
  },

  startTimer() {
    this.updateText();
    const self = this;
    this.interval = setInterval(() => {
      self.time--;
      if (self.time === 0) {
        if (self.solveCount === 0) {
          self.time = 80;
          revealInput();
        } else if (self.solveCount === 1) {
          self.time = 100;
          revealInput();
        } else if (self.solveCount === 2) {
          self.time = 120;
          revealInput();
        } else if (self.solveCount === 3) {
          self.time = 140;
          revealInput();
        } else {
          clearInterval(this.interval);
        }
        self.solveCount++;
      }
      self.updateText();
    }, 1000);
  },
};
solves.startTimer();

draw.first.push(bigBox, regenerate, unknown, solves);

// Event Listeners
document.addEventListener("mousemove", (e) => {
  const rect = cnv.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

document.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    mouse.leftDown = true;
  } else if (e.button === 2) {
    mouse.rightDown = true;
  }
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Classes
class Box {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = smallSize;
    this.color = type === "input" ? "white" : green;
    this.revealed = false;

    if (type === "input") {
      inputBoxes.push(this);
      checkClick.push(this);
    } else if (type === "output") {
      outputBoxes.push(this);
    } else {
      goalBoxes.push(this);
    }
    if (type != "input") draw.first.push(this);
    else drawInputs.first.push(this);
  }

  draw() {
    ctx.fillStyle = boxBackground;
    ctx.fillRect(this.x, this.y, this.size, this.size);

    ctx.strokeStyle = this.revealed ? green : this.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.size, this.size);

    ctx.fillStyle = this.revealed ? green : this.color;
    ctx.font = "60px Inconsolata";
    let fontSize = 60;

    let metrics = ctx.measureText(this.num);
    while (metrics.width > this.size - 5) {
      fontSize--;
      ctx.font = fontSize + "px Inconsolata";
      metrics = ctx.measureText(this.num);
    }

    ctx.fillText(
      this.num,
      this.x + this.size / 2 - metrics.width / 2,
      this.y + this.size / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
    );
  }
}

class Line {
  constructor(lineStart, lineEnd, color, type) {
    this.color = color;
    this.lineStart = lineStart;
    this.lineEnd = lineEnd;

    if (type === "input") drawInputs.second.push(this);
    else draw.second.push(this);
    if (this.color === "red") solutionLines.push(this);
  }

  draw() {
    ctx.lineWidth = this.color === "white" ? 4 : 10;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.lineStart.x, this.lineStart.y);
    ctx.lineTo(this.lineEnd.x, this.lineEnd.y);
    ctx.stroke();
  }
}

class Option {
  constructor(n, text, value, color, fontSize, clickCallback) {
    this.x = 140;
    this.y = n * 60 + 10;
    this.color = color;
    this.fontSize = fontSize;
    this.size = optionSize;
    this.text = text;
    this.value = value;
    this.clickCallback = clickCallback;

    draw.first.push(this);
  }

  draw() {
    this.checkClick();

    ctx.strokeStyle = "white";
    ctx.strokeRect(this.x, this.y, this.size, this.size);

    centerText(
      this.x + this.size / 2,
      this.y + this.size / 2,
      this.value,
      this.fontSize + "px Inconsolata",
      this.color
    );

    ctx.font = "30px Inconsolata";
    ctx.fillStyle = green;
    const metrics = ctx.measureText(":");

    ctx.fillText(
      this.text,
      10,
      this.y + this.size / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
    );
  }

  checkClick() {
    if (mouse.leftDown || mouse.rightDown) {
      if (mouse.x > this.x && mouse.x < this.x + this.size && mouse.y > this.y && mouse.y < this.y + this.size) {
        this.clickCallback(this);
      }
    }
  }
}

// Inputs
createInputs();

// Outputs and Goals
createOutputs();

// Options
new Option(0, "Inputs:", 5, "white", 40, (self) => {
  if (mouse.leftDown) self.value = (self.value % 5) + 1;
  if (mouse.rightDown) self.value = ((self.value + 3) % 5) + 1;

  inputNum = self.value;
  inputBoxes = [];
  drawInputs.first = [];
  drawInputs.second = [];
  createInputs();
  generateFormulas();
  setBoxes();
  solves.solveCount = 0;
  solves.time = 60;
  solves.updateText();
  clearInterval(solves.interval);
  solves.startTimer();
});

new Option(1, "Outputs:", 2, "white", 40, (self) => {
  if (mouse.leftDown) self.value = (self.value % 2) + 1;
  if (mouse.rightDown) self.value = (self.value % 2) + 1;

  outputNum = self.value;
  outputBoxes = [];
  drawOutputs.boxes = [];
  drawOutputs.lines = [];
  createOutputs();
  generateFormulas();
  setBoxes();
  solves.solveCount = 0;
  solves.time = 60;
  solves.updateText();
  clearInterval(solves.interval);
  solves.startTimer();
});

new Option(2, "Solves:", "ON", green, 20, (self) => {
  if (self.value === "ON") {
    self.value = "OFF";
    self.color = "red";
  } else {
    self.value = "ON";
    self.color = green;
  }
});

// Functions
function equallySpace(itemNum, itemIndex, add) {
  return (bigBox.size / itemNum) * itemIndex + (bigBox.size / itemNum - smallSize) / 2 + add;
}

// Create random formula
function generateFormulas() {
  solved = false;
  let maxLayers = inputNum + 7;
  let minLayers = inputNum + 2;
  let maxSum = maxLayers + minLayers + 1;

  const num1 = Math.floor(Math.random() ** 2 * (maxLayers + 1 - minLayers) + minLayers);
  const num2 = Math.floor(
    Math.random() ** 2 * (maxLayers + num1 > maxSum ? maxSum + 1 - minLayers - num1 : maxLayers + 1 - minLayers) +
      minLayers
  );
  const layerNums = [num1, num2];

  for (let n1 = 0; n1 < 2; n1++) {
    let array = new Array(layerNums[n1]);

    let available = [];
    for (let n2 = 0; n2 < array.length; n2++) {
      available.push(n2);
    }

    for (let n2 = 0; n2 < inputNum; n2++) {
      const i = randInt(0, available.length - 1);
      array[available[i]] = `inputs[${n2}]`;
      available.splice(i, 1);
    }

    for (let i = 0; i < available.length; i++) {
      array[available[i]] = randInt(0, 9);
    }

    const operations = [
      (a, b) => {
        return `(${a} + ${b})`;
      },
      (a, b) => {
        return `(${a} - ${b})`;
      },
      (a, b) => {
        return `(${b} - ${a})`;
      },
      (a, b) => {
        return `(${a} * ${b})`;
      },
      (a) => {
        return `(${a} ** 2)`;
      },
    ];

    const i = Math.floor(Math.random(layerNums[n1]));
    formulas[n1] = array[i];
    array.splice(i, 1);

    for (let n2 = 0; n2 < layerNums[n1] - 1; n2++) {
      const arrI = randInt(0, array.length - 1);
      const opI = randInt(0, Number.isInteger(array[arrI]) ? operations.length - 1 : 3);
      formulas[n1] = operations[opI](formulas[n1], array[arrI]);
      if (opI === 4) {
        operations.pop();
      }
      array.splice(arrI, 1);
    }
  }
}

function centerText(x, y, text, font, color, centerArray) {
  ctx.fillStyle = color;
  ctx.font = font;
  const metrics = ctx.measureText(text);

  if (!centerArray) centerArray = [true, true];

  const drawX = centerArray[0] ? x - metrics.width / 2 : x;
  const drawY = centerArray[1] ? y + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2 : y;

  ctx.fillText(text, drawX, drawY);
}

function setBoxes() {
  for (let j = 0; j < inputNum; j++) {
    inputSolutions[j] = randInt(0, 9);
  }

  for (let i = 0; i < goalBoxes.length; i++) {
    const goalBox = goalBoxes[i];
    goalBox.num = getResult(i, inputSolutions);
  }

  for (let i = 0; i < inputBoxes.length; i++) {
    inputBoxes[i].num = randInt(0, 9);
    inputBoxes[i].revealed = false;
  }

  for (let i = 0; i < solutionLines.length; i++) {
    solutionLines[i].color = "red";
  }

  updateOutputs();
}

function createInputs() {
  // Left inputs
  for (let n = 0; n < Math.ceil(inputNum / 2); n++) {
    const x = bigBox.x - smallSize - spacing;
    const y = equallySpace(Math.ceil(inputNum / 2), n, bigBox.y);
    const lineStart = { x: x + smallSize, y: y + smallSize / 2 };
    const lineEnd = { x: x + smallSize + spacing, y: y + smallSize / 2 };
    const type = "input";

    new Box(x, y, type);
    new Line(lineStart, lineEnd, "white", true);
  }

  // Bottom inputs
  for (let n = 0; n < Math.floor(inputNum / 2); n++) {
    const x = equallySpace(Math.floor(inputNum / 2), n, bigBox.x);
    const y = bigBox.y + bigBox.size + spacing;
    const lineStart = { x: x + smallSize / 2, y: y };
    const lineEnd = { x: x + smallSize / 2, y: y - spacing };
    const type = "input";

    new Box(x, y, type, n);
    new Line(lineStart, lineEnd, "white", true);
  }
}

function createOutputs() {
  // Outputs
  for (let n = 0; n < 2; n++) {
    const x = bigBox.x + bigBox.size + spacing;
    const y = equallySpace(2, n, bigBox.y);
    const lineStart = { x: x - spacing, y: y + smallSize / 2 };
    const lineEnd = { x: x, y: y + smallSize / 2 };
    const type = "output";

    new Box(x, y, type);
    new Line(lineStart, lineEnd, "white");
  }

  // Goals
  for (let n = 0; n < 2; n++) {
    const x = bigBox.x + bigBox.size + smallSize + 2 * spacing;
    const y = equallySpace(2, n, bigBox.y);
    const lineStart = { x: x - spacing, y: y + smallSize / 2 };
    const lineEnd = { x: x, y: y + smallSize / 2 };
    const type = "goal";

    new Box(x, y, type);
    new Line(lineStart, lineEnd, "red");
  }
}

function getResult(n, inputs) {
  return eval(formulas[n]);
}

function updateOutputs() {
  for (let i = 0; i < 2; i++) {
    const output = outputBoxes[i];
    const inputs = inputBoxes.map((obj) => obj.num);

    output.num = getResult(i, inputs);
  }
}

function revealInput() {
  const unrevealed = inputBoxes.filter((obj) => !obj.revealed);
  const i = randInt(0, unrevealed.length - 1);
  const input = unrevealed[i];

  input.revealed = true;
  input.num = inputSolutions[i];

  updateOutputs();
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function loop() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  for (let i = 0; i < draw.second.length; i++) {
    draw.second[i].draw();
  }

  for (let i = 0; i < drawInputs.second.length; i++) {
    drawInputs.second[i].draw();
  }

  for (let i = 0; i < draw.first.length; i++) {
    draw.first[i].draw();
  }

  for (let i = 0; i < drawInputs.first.length; i++) {
    drawInputs.first[i].draw();
  }

  if ((mouse.leftDown || mouse.rightDown) && !solved) {
    for (let i = 0; i < inputBoxes.length; i++) {
      const box = inputBoxes[i];
      if (box.revealed) continue;
      const width = box.w || box.size;
      const height = box.h || box.size;
      if (mouse.x > box.x && mouse.x < box.x + width && mouse.y > box.y && mouse.y < box.y + height) {
        if (mouse.leftDown) {
          box.num = (box.num + 1) % 10;
        } else {
          box.num = (box.num + 9) % 10;
        }
        updateOutputs();
      }
    }
  }

  if (outputBoxes[0].num === goalBoxes[0].num && outputBoxes[1].num === goalBoxes[1].num) {
    for (let i = 0; i < solutionLines.length; i++) {
      solutionLines[i].color = green;
      solved = true;

      clearInterval(solves.interval);
      solves.time = 0;
      solves.updateText();
    }
  }

  mouse.leftDown = false;
  mouse.rightDown = false;

  requestAnimationFrame(loop);
}

generateFormulas();
setBoxes();
updateOutputs();
loop();
