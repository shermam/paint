const form = document.querySelector("form");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;
ctx.lineWidth = 5;
ctx.imageSmoothingEnabled = false;
let pressed = false;
let foreground = "black";
let background = "white";

document.querySelector("input#foreground").addEventListener("change", (e) => {
  foreground = e.target.value;
});

document.querySelector("input#background").addEventListener("change", (e) => {
  background = e.target.value;
});

canvas.addEventListener("mousedown", (e) => {
  ctx.beginPath();
  ctx.fillStyle = foreground;
  ctx.strokeStyle = foreground;
  const mode = new FormData(form).get("mode");
  switch (mode) {
    case "line":
      ctx.moveTo(e.offsetX, e.offsetY);
      break;
    case "bucket":
      const bucketColors = getForegroundRGB(foreground);
      paintBucket(e.offsetX, e.offsetY, bucketColors);
      break;
    case "brush":
      ctx.moveTo(e.offsetX, e.offsetY);
      pressed = true;
      break;
    case "roundBrush":
      pressed = true;
      break;
    case "eraser":
      ctx.fillStyle = background;
      pressed = true;
      break;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const mode = new FormData(form).get("mode");
  switch (mode) {
    case "brush":
      if (!pressed) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      break;
    case "roundBrush":
      if (!pressed) return;
      ctx.beginPath();
      ctx.ellipse(e.offsetX, e.offsetY, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      break;
    case "eraser":
      if (!pressed) return;
      ctx.beginPath();
      ctx.ellipse(e.offsetX, e.offsetY, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      break;
  }
});

canvas.addEventListener("mouseup", (e) => {
  ctx.closePath();
  const mode = new FormData(form).get("mode");
  switch (mode) {
    case "line":
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      break;
    case "brush":
      pressed = false;
      break;
    case "roundBrush":
      pressed = false;
      break;
    case "eraser":
      ctx.fillStyle = foreground;
      pressed = false;
      break;
  }
});

function getForegroundRGB(foreground) {
  const colors = [];
  foreground = foreground.replace("#", "");
  colors[0] = parseInt(foreground.substring(0, 2), 16);
  colors[1] = parseInt(foreground.substring(2, 4), 16);
  colors[2] = parseInt(foreground.substring(4), 16);
  return colors;
}

async function paintBucket(x, y, colors) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const index = toIndex(x, y);
  const initialValue = {
    r: imageData.data[index + 0],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3],
  };

  const seen = new Set();
  const q = [index];
  while (q.length > 0) {
    const index = q.shift();
    if (seen.has(index)) continue;
    seen.add(index);
    const { x, y } = fromIndex(index);

    // Setting the color to red
    // TODO: Change to be dinamic
    imageData.data[index + 0] = colors[0];
    imageData.data[index + 1] = colors[1];
    imageData.data[index + 2] = colors[2];
    imageData.data[index + 3] = 255;

    const neighbors = [
      [x, bound(y - 1, h)], // top
      [bound(x + 1, w), y], // right
      [x, bound(y + 1, h)], // bottom
      [bound(x - 1, w), y], // left
    ];

    for (const [x, y] of neighbors) {
      const index = toIndex(x, y);
      const currentValue = {
        r: imageData.data[index + 0],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3],
      };

      if (compareColor(currentValue, initialValue)) {
        q.push(index);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function bound(n, b) {
  return Math.max(0, Math.min(n, b));
}

function compareColor(a, b) {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function toIndex(x, y) {
  return (y * w + x) * 4;
}

function fromIndex(i) {
  i = i / 4;
  return {
    x: i % w,
    y: (i / w) | 0,
  };
}
