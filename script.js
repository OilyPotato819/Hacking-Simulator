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
let inputBoxes = [];
let outputBoxes = [];
let goalBoxes = [];
let formulas = [];
let mouse = {};

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
      ctx.fillStyle = 'rgb(30, 30, 30)';
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      const metrics = ctx.measureText('Regenerate');
      ctx.fillText(
         'Regenerate',
         this.x + this.w / 2 - metrics.width / 2,
         this.y + this.h / 2 + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2
      );
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
      ctx.font = '30px Arial';
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

document.addEventListener('mousemove', (e) => {
   const rect = cnv.getBoundingClientRect();
   mouse.x = e.clientX - rect.left;
   mouse.y = e.clientY - rect.top;
});

// Classes
class Box {
   constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.size = smallSize;
      this.color = type === 'input' ? 'white' : 'rgb(0,200,0)';
      this.num = 1;

      if (type === 'input') inputBoxes.push(this);
      else if (type === 'output') outputBoxes.push(this);
      else goalBoxes.push(this);
      boxes.push(this);
   }

   draw() {
      ctx.fillStyle = 'rgb(30, 30, 30)';
      ctx.fillRect(this.x, this.y, this.size, this.size);

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.size, this.size);

      ctx.fillStyle = this.color;
      ctx.font = '60px Arial';
      let fontSize = 60;

      let metrics = ctx.measureText(this.num);
      while (metrics.width > this.size - 5) {
         fontSize--;
         ctx.font = fontSize + 'px Arial';
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
   }

   draw() {
      ctx.lineWidth = this.color === 'red' ? 10 : 4;
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

   new Box(x, y, type);
   new Line(lineStart, lineEnd, 'white');
}

// Bottom inputs
for (let n = 0; n < Math.floor(inputNum / 2); n++) {
   const x = equallySpace(Math.floor(inputNum / 2), n, bigBox.x);
   const y = bigBox.y + bigBox.size + spacing;
   const lineStart = { x: x + smallSize / 2, y: y };
   const lineEnd = { x: x + smallSize / 2, y: y - spacing };
   const type = 'input';

   new Box(x, y, type);
   new Line(lineStart, lineEnd, 'white');
}

// Outputs
for (let n = 0; n < 2; n++) {
   const x = bigBox.x + bigBox.size + spacing;
   const y = equallySpace(2, n, bigBox.y);
   const lineStart = { x: x - spacing, y: y + smallSize / 2 };
   const lineEnd = { x: x, y: y + smallSize / 2 };
   const type = 'output';

   new Box(x, y, type);
   new Line(lineStart, lineEnd, 'white');
}

// Goals
for (let n = 0; n < 2; n++) {
   const x = bigBox.x + bigBox.size + smallSize + 2 * spacing;
   const y = equallySpace(2, n, bigBox.y);
   const lineStart = { x: x - spacing, y: y + smallSize / 2 };
   const lineEnd = { x: x, y: y + smallSize / 2 };
   const type = 'goal';

   new Box(x, y, type);
   new Line(lineStart, lineEnd, 'red');
}

function equallySpace(itemNum, itemIndex, add) {
   return (bigBox.size / itemNum) * itemIndex + (bigBox.size / itemNum - smallSize) / 2 + add;
}

// Create random formula
let maxSum = 20;
let max = 12;
let min = 5;
const num1 = Math.floor(Math.random() ** 2 * (max + 1 - min) + min);
const num2 = Math.floor(Math.random() ** 2 * (max + num1 > maxSum ? maxSum + 1 - min - num1 : max + 1 - min) + min);
const layerNums = [num1, num2];

for (let n = 0; n < 2; n++) {
   let array = new Array(layerNums[n]);

   let available = [];
   for (let o = 0; o < array.length; o++) {
      available.push(o);
   }

   for (let o = 0; o < inputNum; o++) {
      const i = Math.floor(Math.random() * available.length);
      array[available[i]] = String.fromCharCode(97 + o);
      available.splice(i, 1);
   }

   for (let i = 0; i < available.length; i++) {
      array[available[i]] = Math.floor(Math.random() * 10);
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
      (a, b) => {
         return `(${a} ^ ${b})`;
      },
   ];

   const i = Math.floor(Math.random(array.length));
   formulas[n] = array[i];
   array.splice(i, 1);

   for (let o = 0; o < array.length; o++) {
      const i = Math.floor(Math.random() * array.length);
      formulas[n] = operations[Math.floor(Math.random() * operations.length)](formulas[n], array[i]);
      array.splice(i, 1);
   }
}

console.log(formulas);

function loop() {
   ctx.fillStyle = 'black';
   ctx.fillRect(0, 0, cnv.width, cnv.height);

   for (let i = 0; i < lines.length; i++) {
      lines[i].draw();
   }

   for (let i = 0; i < boxes.length; i++) {
      boxes[i].draw();
   }

   requestAnimationFrame(loop);
}

loop();
