const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;

canvas.addEventListener("mousedown", (e) => {
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener("mouseup", (e) => {
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});
