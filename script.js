const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

cnv.width = 1000;
cnv.height = 800;

const smallSize = 100;
const bigSize = 350;
const spacing = 50;
let inputNum = 5;
let boxes = [];
let lines = [];
let inputBoxes = [];
let outputBoxes = [];
let goalBoxes = [];

let bigBox = {
   x: cnv.width / 2 - bigSize / 2 - spacing / 2 - smallSize / 2,
   y: cnv.height / 2 - bigSize / 2 - 100,
   size: bigSize,
   color: 'green',
   draw: function () {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.size, this.size);
   },
};

boxes.push(bigBox);

class Box {
   constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.size = smallSize;
      this.color = type === 'input' ? 'white' : 'green';

      if (type === 'input') inputBoxes.push(this);
      else if (type === 'output') outputBoxes.push(this);
      else goalBoxes.push(this);
      boxes.push(this);
   }

   draw() {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(this.x, this.y, this.size, this.size);
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

function loop() {
   ctx.fillStyle = 'black';
   ctx.fillRect(0, 0, cnv.width, cnv.height);

   for (let i = 0; i < lines.length; i++) {
      lines[i].draw();
   }

   for (let i = 0; i < boxes.length; i++) {
      boxes[i].draw();
   }

   ctx.strokeStyle = 'green';
   ctx.strokeRect(cnv.width / 2 - 100, cnv.height - 80, 200, 50);
   ctx.fillStyle = 'green';
   ctx.font = '30px Arial';
   ctx.fillText('New Puzzle', cnv.width / 2, cnv.height - 80);

   requestAnimationFrame(loop);
}

loop();
