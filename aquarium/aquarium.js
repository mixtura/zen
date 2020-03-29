function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(vec2) {
  return new Vector(this.x + vec2.x, this.y + vec2.y);  
}

Vector.prototype.subtract = function(vec2) {
  return new Vector(this.x - vec2.x, this.y - vec2.y);
}

Vector.prototype.multiply = function(value) {
  return new Vector(this.x * value, this.y * value);
}

Vector.prototype.moveAlong = function(vec, val) {
  let rotation = Math.atan2(vec.x, vec.y);

  return new Vector(
    this.x + Math.sin(rotation) * val, 
    this.y + Math.cos(rotation) * val);
}

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
}

Vector.prototype.normalize = function() {
  let magnitude = this.magnitude();

  return new Vector(
    this.x / magnitude, 
    this.y / magnitude);
}

Vector.up = new Vector(0, 1);
Vector.left = new Vector(-1, 0);
Vector.right = new Vector(1, 0);
Vector.down = new Vector(0, -1);

function drawFishEye(ctx, x, y, radius, pupilRatio, lookDirX, lookDirY) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);

  ctx.fillStyle = "#FFFFFF88";
  
  ctx.stroke();
  ctx.fill();
  
  let pupilRadius = radius * pupilRatio;
  let maxPupilOffset = radius - pupilRadius;
  
  let xPupilOffset = maxPupilOffset * lookDirX;
  let yPupilOffset = maxPupilOffset * lookDirY;
  
  ctx.beginPath();
  ctx.arc(x + xPupilOffset, y + yPupilOffset, pupilRadius, 0, 2 * Math.PI);

  ctx.fillStyle = "#001242";
  ctx.fill();
}

function drawFishTail(ctx, x, y, endWidth, length) {
  let yShift = Math.sin(new Date() / 1000) * length * 0.1;

  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x, y + endWidth / 3, x - length, y + endWidth / 2 + yShift);
  ctx.quadraticCurveTo(x - 0.5 * length, y, x - length, y - endWidth / 2 + yShift);
  ctx.quadraticCurveTo(x, y - endWidth / 3, x, y);
}

function drawFishBody(ctx, x, y, height, length) {
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + length / 2, y + height / 2, x + length, y);
  ctx.quadraticCurveTo(x + length / 2, y - height / 2, x, y);
}

function drawFishFloater(ctx, x, y, size, phase) {
  let yShift = Math.sin(new Date() / 1000 + phase) * 0.1 * size;

  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x, y - size * 0.4, x - size, y + size * 0.5 + yShift);
  ctx.quadraticCurveTo(x, y + size * 0.6, x, y);
}

function drawFishTopFloater(ctx, x, y, size, height) {
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * 0.35, y - height);
  ctx.lineTo(x - size * 0.7, 0);
}

function drawFish(ctx, fish, flip, rotation) {
  let {size, position, lookDir, pupilRatio, kind, color, floaterPhase} = fish;
  
  ctx.translate(position.x, position.y);
  ctx.rotate(rotation);

  if(flip) {
    ctx.transform(-1, 0, 0, 1, 0, 0);
  }

  let bodyLength = size * kind.bodyLength;

  ctx.fillStyle = color;
  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#FFFFFF25";
  
  ctx.beginPath();
  
  drawFishTopFloater(ctx, bodyLength * 0.2, -size * 0.15, bodyLength, kind.topFloaterHeight * size);
  
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  
  drawFishBody(ctx, -bodyLength * 0.5, 0, size, bodyLength);
  
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  
  drawFishTail(ctx, -bodyLength * 0.4, 0, size * kind.tailWidth, size * kind.tailLength);
  drawFishFloater(ctx, bodyLength * 0.05, size * 0.1, size * kind.mainFloaterLength, floaterPhase);
  
  ctx.fill();
  ctx.stroke();
  
  drawFishEye(ctx, bodyLength * 0.2, -size * 0.05, size * kind.eyeSize, pupilRatio, lookDir.x, lookDir.y);

  ctx.resetTransform();
}

function drawWeed(ctx, weed) {
  ctx.strokeStyle = weed.color;
  ctx.lineWidth = weed.width;
  ctx.lineCap = "round"; 

  ctx.beginPath();
  ctx.moveTo(weed.position.x, weed.position.y);

  let segmentsCount = weed.length / weed.segmentLength;
  let currentSegmentBendDir = 1;

  for(let segment = 0; segment < segmentsCount; segment++) {
    let posX = weed.position.x;
    let posY = weed.position.y + segment * weed.segmentLength;
    let bendX = posX + weed.bendDistance * currentSegmentBendDir * 2;
    let bendY = posY + weed.segmentLength * 1.2;

    posX = addShake(posX);
    posY = addShake(posY);
    bendX = addShake(bendX);
    bendY = addShake(bendY);

    ctx.quadraticCurveTo(bendX, bendY, posX, posY);

    currentSegmentBendDir = currentSegmentBendDir * (-1);
  }

  ctx.stroke();

  function addShake(val) {
    return val + Math.sin(Math.random() / 4) * 10;
  }
}

function drawFishes(ctx, fishes, delta) {
  for(let fish of fishes) {
    fish.position = fish.position.moveAlong(fish.moveDir, fish.speed * delta);

    let flip = fish.moveDir.x < 0;
    
    drawFish(ctx, fish, flip, 0);
  }
}

function drawBubbles(ctx, bubbles, delta) {
  const bubbleMoveSpeedFactor = 0.03;
  const bubbleSideMoveAmplitude = 0.2;
  const bubbleSideMoveSpeedFactor = 0.1;

  ctx.beginPath();
  
  for(let bubble of bubbles) {
    var shiftX = Math.sin(bubble.position.y * bubbleSideMoveSpeedFactor) * bubbleSideMoveAmplitude;
    
    bubble.position.y -= bubble.radius * bubbleMoveSpeedFactor * delta;
    bubble.position.x = bubble.position.x + shiftX;

    ctx.transform(1 + Math.random() * 0.5, 0, 0, 1 + Math.random() * 0.5, bubble.position.x, bubble.position.y);

    ctx.moveTo(bubble.radius, 0);
    ctx.arc(0, 0, bubble.radius, 0, 2 * Math.PI);
    ctx.resetTransform();
  }
  
  ctx.strokeStyle = '#FFFFFF44';
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawWeeds(ctx, weeds, width, height) {
  let currentLayer = 0;

  for(let weed of weeds) {
    if(currentLayer != weed.layer) {
      let phase = Math.sin(new Date() / 1000 + currentLayer) / 50;
      
      ctx.resetTransform();
      ctx.rotate(Math.PI);
      ctx.transform(1, 0, phase, 1, -width, -height * 2 - 50);
  
      currentLayer = weed.layer;
    }

    drawWeed(ctx, weed);
  }
}

function drawAnchor(ctx, x, y, length) {
  ctx.rotate(Math.PI / 20);
  ctx.translate(x, y);

  let width = 33;
  let plankLength = 180;
  let plankWidth = 25;
  let plankOffset = 80;
  
  ctx.fillStyle = "#00000044";
  ctx.fillRect(-plankLength / 2, plankOffset, plankLength / 2, plankWidth);
  ctx.fillRect(width, plankOffset, plankLength / 2, plankWidth); 
  
  ctx.beginPath();
  ctx.rect(0, 0, width, length); 
  ctx.moveTo(width / 2, -45);
  ctx.arc(width / 2, -45, 50, 0, Math.PI * 2, false);
  ctx.arc(width / 2, -45, 30, 0, Math.PI * 2, true);
  ctx.fill();
  
  ctx.translate(width / 2, length);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  
  drawShoulder(-1);

  ctx.moveTo(0, 0);
  
  drawShoulder(1);

  ctx.fill();
  ctx.resetTransform();

  function drawShoulder(dir) {
    const shoulderWidth = 180;
    const shoulderHeight = 120;

    ctx.quadraticCurveTo(shoulderWidth * 1.2 * dir, 0, shoulderWidth * dir, -shoulderHeight);
    ctx.lineTo(shoulderWidth * dir * 0.9, -shoulderHeight);
    ctx.lineTo(shoulderWidth * dir, -shoulderHeight - 50);
    ctx.quadraticCurveTo(shoulderWidth * 1.5 * dir, 0, 0, 80);
  }
}

const fishKinds = [{
  tailWidth: 0.45,
  tailLength: 0.5,
  mainFloaterLength: 0.33,
  topFloaterHeight: 0.2,
  bodyLength: 1.1,
  eyeSize: 0.1
},
{
  tailWidth: 0.5,
  tailLength: 0.5,
  mainFloaterLength: 0.4,
  topFloaterHeight: 0.15,
  bodyLength: 0.7,
  eyeSize: 0.08
},
{
  tailWidth: 0.35,
  tailLength: 0.45,
  mainFloaterLength: 0.45,
  topFloaterHeight: 0.2,
  bodyLength: 1,
  eyeSize: 0.11
},
{
  tailWidth: 0.4,
  tailLength: 0.3,
  mainFloaterLength: 0.35,
  topFloaterHeight: 0.15,
  bodyLength: 0.8,
  eyeSize: 0.07
}];

function aquarium(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  const width = window.innerWidth;
  const height = window.innerHeight; 
  const fishes = [];
  const weeds = [];  
  let bubbles = [];
  let lastFrameTime = new Date();

  canvasEl.width = width;
  canvasEl.height = height;

  addSomeFishes(5);
  addSomeWeed(20);

  function addSomeFishes(count) {
    while(--count >= 0) {
      fishes.push({
        position: getRandPos(),
        moveDir: getRandDir(),
        lookDir: getRandDir(),
        size: getRandInRange(30, 200),
        speed: getRandInRange(0.05, 0.3),
        pupilRatio: getRandInRange(0.6, 0.8),
        kind: fishKinds[Math.floor(Math.random() * fishKinds.length)],
        color: getRandColor(150,255,0,150,0,150),
        floaterPhase: Math.round(getRandInRange(0, 3))
      });
    }

    function getRandPos() {
      return new Vector(
        Math.random() * width,
        Math.random() * height
      );
    }

    function getRandDir() {
      return new Vector(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      );
    }
  }

  function addSomeWeed(count) {
    const maxWeedLength = 500;
    const minWeedLength = 100;

    while(--count >= 0) {
      weeds.push({
        length: getRandInRange(minWeedLength, maxWeedLength),
        width: getRandInRange(4, 7),
        layer: Math.round(getRandInRange(0, 3)),
        bendDistance: getRandInRange(8, 20),
        segmentLength: getRandInRange(30, 40),
        color: getRandColor(0, 10, 20, 60, 50, 80),
        position: new Vector(
          getRandInRange(0, width), 
          getRandInRange(height, height + 20))
      });
    }

    weeds.sort((a, b) => a.layer > b.layer);
  }

  function getRandColor(
    minR = 0, maxR = 255, 
    minB = 0, maxB = 255, 
    minG = 0, maxG = 255) {
      
    let r = getRandInRange(minR, maxR);
    let g = getRandInRange(minG, maxG);
    let b = getRandInRange(minB, maxB);

    return getColor(r, g, b);
  }

  function getColor(r, g, b) {
    return `rgb(${r},${g},${b})`;
  }

  function getRandInRange(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  function checkInBounds(vec) {
    return (
      vec.x > 0 && 
      vec.x < width &&
      vec.y > 0 &&
      vec.y < height);
  }

  setInterval(function() {
    for(let fish of fishes) {
      let shouldChangeMoveDir = Math.random() > 0.95 || !checkInBounds(fish.position);
      let shouldChangeLookDir = Math.random() > 0.4;
      let shouldMakeBubble = Math.random() > 0.7;

      if(shouldChangeMoveDir) {
        let x = Math.random();
        let y = Math.random();

        if(fish.moveDir.x > 0) {
          x = x * (-1);
        } 

        if(fish.moveDir.y > 0) {
          y = y * (-1);
        }

        fish.moveDir = new Vector(x, y);
      }

      if(shouldChangeLookDir) {
        fish.lookDir = new Vector(
          Math.random() - 0.5, 
          Math.random() - 0.5);
      }

      if(shouldMakeBubble) {
        let bubblePosX = fish.position.x;
        let bubblePosY = fish.position.y;
        
        if(fish.moveDir.x > 0) {
          bubblePosX += fish.size / 2;
        } else {
          bubblePosX -= fish.size / 2;
        }

        bubbles.push({
          position: new Vector(bubblePosX, bubblePosY),
          radius: getRandInRange(2, fish.size / 10)
        });
      }

      bubbles = bubbles.filter(b => checkInBounds(b.position));
    }
  }, 300);

  setInterval(function() {
    let g = Math.sin(new Date() / 3000 + 10) * 30;
    let b = Math.sin(new Date() / 2000) * 30 + 20;
    let backgroundColor = getColor(0, g, b);
    var currentTime = new Date();
    let delta = currentTime - lastFrameTime;

    lastFrameTime = currentTime;

    ctx.resetTransform();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    drawAnchor(ctx, width / 2, height - 500, 380);
    drawFishes(ctx, fishes, delta);
    drawBubbles(ctx, bubbles, delta);
    drawWeeds(ctx, weeds, width, height);
  }, 0);
}

aquarium(document.getElementById("waterCanvas"))