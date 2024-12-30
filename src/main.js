const canvas = document.getElementById('lightCanvas');
const ctx = canvas.getContext('2d');


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


resizeCanvas();
window.addEventListener('resize', resizeCanvas);


let mouseX = 0;
let mouseY = 0;


const walls = [
  [canvas.width/2, canvas.height/2, 60, 60],
  [250, 500, 60, 120],
  [600, 300, 60, 60],
  [700, 400, 60, 60]
];


const LIGHT_RADIUS = Math.max(canvas.width, canvas.height) / 5;
const LIGHT_INTENSITY = 0.5;
const NUM_RAYS = 360;


function getIntersection(ray, segment) {
  const [x1, y1, x2, y2] = segment;
  const [rx, ry, rEndX, rEndY] = ray;
 
  const den = (x1 - x2) * (ry - rEndY) - (y1 - y2) * (rx - rEndX);
  if (den === 0) return null;
 
  const t = ((x1 - rx) * (ry - rEndY) - (y1 - ry) * (rx - rEndX)) / den;
  const u = -((x1 - x2) * (y1 - ry) - (y1 - y2) * (x1 - rx)) / den;
 
  if (t > 0 && t < 1 && u > 0 && u < 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
      distance: u * Math.sqrt((rEndX - rx) ** 2 + (rEndY - ry) ** 2)
    };
  }
 
  return null;
}


function getWallSegments(wall) {
  const [x, y, w, h] = wall;
  return [
    [x, y, x + w, y],         // top
    [x + w, y, x + w, y + h], // right
    [x + w, y + h, x, y + h], // bottom
    [x, y + h, x, y]          // left
  ];
}


function castRay(angle) {
  const rayX = mouseX + Math.cos(angle) * LIGHT_RADIUS;
  const rayY = mouseY + Math.sin(angle) * LIGHT_RADIUS;
  const ray = [mouseX, mouseY, rayX, rayY];
 
  let closest = null;
  let minDistance = Infinity;
 
  walls.forEach(wall => {
    const segments = getWallSegments(wall);
    segments.forEach(segment => {
      const intersection = getIntersection(ray, segment);
      if (intersection && intersection.distance < minDistance) {
        minDistance = intersection.distance;
        closest = intersection;
      }
    });
  });
 
  return closest;
}


function createLightGradient() {
  const gradient = ctx.createRadialGradient(
    mouseX, mouseY, 0,
    mouseX, mouseY, LIGHT_RADIUS
  );
 
  gradient.addColorStop(0, `rgba(255, 255, 200, ${LIGHT_INTENSITY})`);
  gradient.addColorStop(0.5, `rgba(255, 255, 150, ${LIGHT_INTENSITY * 0.5})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
 
  return gradient;
}


function drawVisibleArea() {
  ctx.beginPath();
  ctx.moveTo(mouseX, mouseY);
 
  const points = [];
  const angleStep = (Math.PI * 2) / NUM_RAYS;
 
  for (let i = 0; i <= NUM_RAYS; i++) {
    const angle = i * angleStep;
    const intersection = castRay(angle);
   
    if (intersection) {
      points.push(intersection);
      ctx.lineTo(intersection.x, intersection.y);
    } else {
      const rayX = mouseX + Math.cos(angle) * LIGHT_RADIUS;
      const rayY = mouseY + Math.sin(angle) * LIGHT_RADIUS;
      points.push({x: rayX, y: rayY});
      ctx.lineTo(rayX, rayY);
    }
  }
 
  ctx.closePath();
 
  ctx.fillStyle = createLightGradient();
  ctx.fill();
}


function drawCircle() {
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fill();
  ctx.closePath();
}


function drawWalls() {
  walls.forEach(wall => {
    ctx.fillStyle = 'rgba(169, 169, 169, 1)';
    ctx.fillRect(...wall);
  });
}


function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 
  // Dark background
  ctx.fillStyle = 'rgb(10, 10, 10)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
 
  // Draw light and shadows
  drawVisibleArea();
 
  // Draw walls
  drawWalls();
 
  // Draw light source circle
  drawCircle();
}


canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  drawScene();
});


drawScene();

