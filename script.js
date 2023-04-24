// Initialize Canvas
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

cnv.width = 1200;
cnv.height = 800;

// Global Variables
const smallSize = 80;
const bigSize = 300;
const optionSize = 40;
const spacing = 70;
const boxBackground = 'rgb(35, 35, 35)';
const green = 'rgb(0,200,0)';
let solved = false;
let inputNum = 5;
let drawBoxes = [];
let drawLines = [];
let drawInputs = [];
let solutionLines = [];
let inputBoxes = [];
let outputBoxes = [];
let goalBoxes = [];
let checkClick = [];
let mouse = {};
let formulas = [];
let inputSolutions = [];

let bigBox = {
   x: 200,
   y: cnv.height / 2 - bigSize / 2 - 75,
   size: bigSize,
   color: green,
   draw: function () {
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
   draw: function () {
      this.checkClick();

      ctx.fillStyle = boxBackground;
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      ctx.fillStyle = 'white';
      ctx.font = '30px Inconsolata';
      const metrics = ctx.measureText('Regenerate');
      ctx.fillText('Regenerate', this.x + this.w / 2 - metrics.width / 2, this.y + this.h / 2 + 30 / 4);
   },

   checkClick: function () {
      if (mouse.leftDown && mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h) {
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
   draw: function () {
      ctx.fillStyle = boxBackground;
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.strokeStyle = green;
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      ctx.fillStyle = green;
      ctx.font = '30px Inconsolata';
      const metrics = ctx.measureText('Unknown Sequence');
      ctx.fillText(
         'Unknown Sequence',
         this.x + this.w / 2 - metrics.width / 2,
         this.y + this.h / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
      );
   },
};

let inputNumBox = {
   x: 120,
   y: 20,
   size: optionSize,
   text: 'Inputs:',
   num: 5,

   draw: function () {
      this.checkClick();

      ctx.fillStyle = boxBackground;
      ctx.fillRect(this.x, this.y, this.size, this.size);

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.size, this.size);

      let metrics;

      ctx.fillStyle = green;
      ctx.font = '30px Inconsolata';
      metrics = ctx.measureText(this.text);
      ctx.fillText(this.text, 10, this.y + this.size / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2);

      ctx.fillStyle = 'white';
      ctx.font = '40px Inconsolata';
      metrics = ctx.measureText(this.num);
      ctx.fillText(
         this.num,
         this.x + this.size / 2 - metrics.width / 2,
         this.y + this.size / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
      );
   },

   checkClick: function () {
      if (mouse.leftDown || mouse.rightDown) {
         if (mouse.x > this.x && mouse.x < this.x + this.size && mouse.y > this.y && mouse.y < this.y + this.size) {
            if (mouse.leftDown) this.num = (this.num % 5) + 1;
            if (mouse.rightDown) this.num = ((this.num + 3) % 5) + 1;

            inputNum = this.num;
            inputBoxes = [];
            drawInputs = [];
            createInputs();
            generateFormulas();
            setBoxes();
            solves.solveCount = 0;
            solves.time = 60;
            solves.updateText();
            clearInterval(solves.interval);
            solves.startTimer();
         }
      }
   },
};

let solves = {
   x: cnv.width - 350,
   y: 200,
   size: optionSize,
   time: 60,
   solveCount: 0,

   draw: function () {
      ctx.fillStyle = green;
      ctx.font = '30px Inconsolata';
      for (let i = 0; i < this.text.length; i++) {
         ctx.fillText(this.text[i], this.x, this.y + i * 50);
      }
   },

   updateText: function () {
      this.text = [`(${this.solveCount}/${inputNum}) Values bypassed.`, `Next solve in ${this.time} seconds`];
   },

   startTimer: function () {
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
      }, 50);
   },
};
solves.startTimer();

drawBoxes.push(bigBox, regenerate, unknown, inputNumBox, solves);

// Event Listeners
document.addEventListener('mousemove', (e) => {
   const rect = cnv.getBoundingClientRect();
   mouse.x = e.clientX - rect.left;
   mouse.y = e.clientY - rect.top;
});

document.addEventListener('mousedown', (e) => {
   if (e.button === 0) {
      mouse.leftDown = true;
   } else if (e.button === 2) {
      mouse.rightDown = true;
   }
});

document.addEventListener('contextmenu', (e) => {
   e.preventDefault();
});

// Classes
class Box {
   constructor(x, y, type, n1) {
      this.x = x;
      this.y = y;
      this.size = smallSize;
      this.color = type === 'input' ? 'white' : green;
      this.revealed = false;

      if (type === 'input') {
         inputBoxes.push(this);
         checkClick.push(this);
      } else if (type === 'output') {
         outputBoxes.push(this);
      } else {
         goalBoxes.push(this);
      }
      if (type != 'input') drawBoxes.push(this);
      else drawInputs.push(this);
   }

   draw() {
      ctx.fillStyle = boxBackground;
      ctx.fillRect(this.x, this.y, this.size, this.size);

      ctx.strokeStyle = this.revealed ? green : this.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.size, this.size);

      ctx.fillStyle = this.revealed ? green : this.color;
      ctx.font = '60px Inconsolata';
      let fontSize = 60;

      let metrics = ctx.measureText(this.num);
      while (metrics.width > this.size - 5) {
         fontSize--;
         ctx.font = fontSize + 'px Inconsolata';
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
   constructor(lineStart, lineEnd, color, inputLine) {
      this.color = color;
      this.lineStart = lineStart;
      this.lineEnd = lineEnd;

      if (inputLine) drawInputs.push(this);
      else drawLines.push(this);
      if (this.color === 'red') solutionLines.push(this);
   }

   draw() {
      ctx.lineWidth = this.color === 'white' ? 4 : 10;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.lineStart.x, this.lineStart.y);
      ctx.lineTo(this.lineEnd.x, this.lineEnd.y);
      ctx.stroke();
   }
}

// Inputs
createInputs();

// Outputs
for (let n = 0; n < 2; n++) {
   const x = bigBox.x + bigBox.size + spacing;
   const y = equallySpace(2, n, bigBox.y);
   const lineStart = { x: x - spacing, y: y + smallSize / 2 };
   const lineEnd = { x: x, y: y + smallSize / 2 };
   const type = 'output';

   new Box(x, y, type, n);
   new Line(lineStart, lineEnd, 'white');
}

// Goals
for (let n = 0; n < 2; n++) {
   const x = bigBox.x + bigBox.size + smallSize + 2 * spacing;
   const y = equallySpace(2, n, bigBox.y);
   const lineStart = { x: x - spacing, y: y + smallSize / 2 };
   const lineEnd = { x: x, y: y + smallSize / 2 };
   const type = 'goal';

   new Box(x, y, type, n);
   new Line(lineStart, lineEnd, 'red');
}

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
   const num2 = Math.floor(Math.random() ** 2 * (maxLayers + num1 > maxSum ? maxSum + 1 - minLayers - num1 : maxLayers + 1 - minLayers) + minLayers);
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
      solutionLines[i].color = 'red';
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
      const type = 'input';

      new Box(x, y, type, n);
      new Line(lineStart, lineEnd, 'white', true);
   }

   // Bottom inputs
   for (let n = 0; n < Math.floor(inputNum / 2); n++) {
      const x = equallySpace(Math.floor(inputNum / 2), n, bigBox.x);
      const y = bigBox.y + bigBox.size + spacing;
      const lineStart = { x: x + smallSize / 2, y: y };
      const lineEnd = { x: x + smallSize / 2, y: y - spacing };
      const type = 'input';

      new Box(x, y, type, n);
      new Line(lineStart, lineEnd, 'white', true);
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
   ctx.fillStyle = 'black';
   ctx.fillRect(0, 0, cnv.width, cnv.height);

   for (let i = 0; i < drawLines.length; i++) {
      drawLines[i].draw();
   }

   for (let i = 0; i < drawBoxes.length; i++) {
      drawBoxes[i].draw();
   }

   for (let i = 0; i < drawInputs.length; i++) {
      drawInputs[i].draw();
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
