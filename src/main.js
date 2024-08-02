const form = document.querySelector("form");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;
ctx.lineWidth = 5;
ctx.imageSmoothingEnabled = false;

canvas.addEventListener("mousedown", (e) => {
  const mode = new FormData(form).get("mode");
  switch (mode) {
    case "line":
      ctx.moveTo(e.offsetX, e.offsetY);
      break;
    case "bucket":
      paintBucket(e.offsetX, e.offsetY);
      break;
  }
});

canvas.addEventListener("mouseup", (e) => {
  const mode = new FormData(form).get("mode");
  switch (mode) {
    case "line":
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      break;
  }
});

async function paintBucket(x, y) {
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
    imageData.data[index + 0] = 255;
    imageData.data[index + 1] = 0;
    imageData.data[index + 2] = 0;
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
