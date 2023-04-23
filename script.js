// Initialize Canvas
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

cnv.width = 1000;
cnv.height = 800;

// Global Variables
const smallSize = 80;
const bigSize = 300;
const spacing = 70;
let inputNum = 5;
let boxes = [];
let lines = [];
let solutionLines = [];
let inputBoxes = [];
let outputBoxes = [];
let goalBoxes = [];
let checkClick = [];
let mouse = {};
let formulas = generateFormulas();
let inputSolutions = [];

let bigBox = {
   x: cnv.width / 2 - bigSize / 2 - spacing / 2 - smallSize / 2,
   y: cnv.height / 2 - bigSize / 2 - 75,
   size: bigSize,
   color: 'rgb(0,200,0)',
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

      ctx.fillStyle = 'rgb(30, 30, 30)';
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      ctx.fillStyle = 'white';
      ctx.font = '30px Inconsolata';
      const metrics = ctx.measureText('Regenerate');
      ctx.fillText(
         'Regenerate',
         this.x + this.w / 2 - metrics.width / 2,
         this.y + this.h / 2 + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2
      );
   },

   checkClick: function () {
      if (mouse.leftDown && mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h) {
         formulas = generateFormulas();
         setBoxes();
      }
   },
};

let unknown = {
   x: cnv.width / 2 - 350 / 2,
   y: 35,
   w: 350,
   h: 60,
   draw: function () {
      ctx.fillStyle = 'rgb(30, 30, 30)';
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.strokeStyle = 'rgb(0,200,0)';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      ctx.fillStyle = 'rgb(0,200,0)';
      ctx.font = '30px Inconsolata';
      const metrics = ctx.measureText('Unknown Sequence');
      ctx.fillText(
         'Unknown Sequence',
         this.x + this.w / 2 - metrics.width / 2,
         this.y + this.h / 2 + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2
      );
   },
};

boxes.push(bigBox, regenerate, unknown);

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
      this.color = type === 'input' ? 'white' : 'rgb(0,200,0)';

      if (type === 'input') {
         inputBoxes.push(this);
         checkClick.push(this);
      } else if (type === 'output') {
         outputBoxes.push(this);
      } else {
         goalBoxes.push(this);
      }
      boxes.push(this);
   }

   draw() {
      ctx.fillStyle = 'rgb(30, 30, 30)';
      ctx.fillRect(this.x, this.y, this.size, this.size);

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.size, this.size);

      ctx.fillStyle = this.color;
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
         this.y + this.size / 2 + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2
      );
   }
}

class Line {
   constructor(lineStart, lineEnd, color) {
      this.color = color;
      this.lineStart = lineStart;
      this.lineEnd = lineEnd;

      lines.push(this);
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

// Left inputs
for (let n = 0; n < Math.ceil(inputNum / 2); n++) {
   const x = bigBox.x - smallSize - spacing;
   const y = equallySpace(Math.ceil(inputNum / 2), n, bigBox.y);
   const lineStart = { x: x + smallSize, y: y + smallSize / 2 };
   const lineEnd = { x: x + smallSize + spacing, y: y + smallSize / 2 };
   const type = 'input';

   new Box(x, y, type, n);
   new Line(lineStart, lineEnd, 'white');
}

// Bottom inputs
for (let n = 0; n < Math.floor(inputNum / 2); n++) {
   const x = equallySpace(Math.floor(inputNum / 2), n, bigBox.x);
   const y = bigBox.y + bigBox.size + spacing;
   const lineStart = { x: x + smallSize / 2, y: y };
   const lineEnd = { x: x + smallSize / 2, y: y - spacing };
   const type = 'input';

   new Box(x, y, type, n);
   new Line(lineStart, lineEnd, 'white');
}

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
   let formulas = [];
   let maxSum = 20;
   let max = 12;
   let min = 5;

   const num1 = Math.floor(Math.random() ** 2 * (max + 1 - min) + min);
   const num2 = Math.floor(Math.random() ** 2 * (max + num1 > maxSum ? maxSum + 1 - min - num1 : max + 1 - min) + min);
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

   return formulas;
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
   }

   for (let i = 0; i < solutionLines.length; i++) {
      solutionLines[i].color = 'red';
   }

   updateOutputs();
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

function randInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1) + min);
}

function loop() {
   ctx.fillStyle = 'black';
   ctx.fillRect(0, 0, cnv.width, cnv.height);

   for (let i = 0; i < lines.length; i++) {
      lines[i].draw();
   }

   for (let i = 0; i < boxes.length; i++) {
      boxes[i].draw();
   }

   if (mouse.leftDown || mouse.rightDown) {
      for (let i = 0; i < inputBoxes.length; i++) {
         const box = inputBoxes[i];
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
         solutionLines[i].color = 'rgb(0,200,0)';
      }
   }

   mouse.leftDown = false;
   mouse.rightDown = false;

   requestAnimationFrame(loop);
}

setBoxes();
updateOutputs();
loop();
