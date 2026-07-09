/* Velocity Runner: Rise of Bharat
   Corrected script.js
   Main fixes:
   - Road is now clearly visible
   - Road tiles use proper local positioning
   - Camera looks down toward the track
   - Drone stays to the side and does not block player
   - Neon Bharat track is brighter
*/

let scene, camera, renderer;
let player, suryaCore, drone;

let roadGroup, obstacleGroup, shardGroup, cityGroup, rainGroup;

let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let animationId = null;

let runnerName = "Aarav Astra";
let currentLane = 1;
const lanes = [-3, 0, 3];

let playerY = 1;
let velocityY = 0;
let gravity = -0.035;
let isJumping = false;
let isSliding = false;
let slideTimer = 0;

let speed = 0.34;
let distance = 0;
let shards = 0;
let highScore = Number(localStorage.getItem("velocityRunnerHighScore") || 0);

let obstacles = [];
let shardItems = [];
let roadTiles = [];
let buildings = [];
let rainDrops = [];

let spawnTimer = 0;
let shardTimer = 0;

const TILE_DEPTH = 8;
const ROAD_TILE_COUNT = 34;
const ROAD_LOOP_DISTANCE = TILE_DEPTH * ROAD_TILE_COUNT;

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const runnerNameInput = document.getElementById("runnerNameInput");
const runnerNameText = document.getElementById("runnerName");
const distanceText = document.getElementById("distance");
const shardsText = document.getElementById("shards");
const highScoreText = document.getElementById("highScore");
const finalDistanceText = document.getElementById("finalDistance");
const finalShardsText = document.getElementById("finalShards");
const abilityText = document.getElementById("abilityText");
const missionText = document.getElementById("missionText");

const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

if (highScoreText) {
  highScoreText.textContent = highScore;
}

function showScreen(screen) {
  homeScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");
  screen.classList.add("active");
}

function startGame() {
  runnerName = runnerNameInput.value.trim() || "Aarav Astra";

  if (runnerNameText) {
    runnerNameText.textContent = runnerName;
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  showScreen(gameScreen);

  distance = 0;
  shards = 0;
  speed = 0.34;
  currentLane = 1;
  playerY = 1;
  velocityY = 0;
  isJumping = false;
  isSliding = false;
  slideTimer = 0;

  gameRunning = true;
  gamePaused = false;
  gameOver = false;

  obstacles = [];
  shardItems = [];
  roadTiles = [];
  buildings = [];
  rainDrops = [];

  spawnTimer = 0;
  shardTimer = 0;

  initThree();
  animate();
}

window.startGame = startGame;

function initThree() {
  const canvas = document.getElementById("gameCanvas");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02030a);
  scene.fog = new THREE.FogExp2(0x061025, 0.01);

  camera = new THREE.PerspectiveCamera(
    68,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 5.2, 9.2);
  camera.lookAt(0, 0.45, -13);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const ambient = new THREE.AmbientLight(0x9feaff, 1.5);
  scene.add(ambient);

  const bharatGlow = new THREE.HemisphereLight(0x00eaff, 0xffaa00, 1.7);
  scene.add(bharatGlow);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
  mainLight.position.set(5, 12, 8);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const cyanLight = new THREE.PointLight(0x00f5ff, 3.5, 55);
  cyanLight.position.set(-5, 5, -8);
  scene.add(cyanLight);

  const goldLight = new THREE.PointLight(0xffd166, 3.2, 55);
  goldLight.position.set(0, 5, -22);
  scene.add(goldLight);

  const purpleLight = new THREE.PointLight(0x8f2cff, 3.2, 55);
  purpleLight.position.set(5, 5, -35);
  scene.add(purpleLight);

  roadGroup = new THREE.Group();
  obstacleGroup = new THREE.Group();
  shardGroup = new THREE.Group();
  cityGroup = new THREE.Group();
  rainGroup = new THREE.Group();

  scene.add(roadGroup);
  scene.add(obstacleGroup);
  scene.add(shardGroup);
  scene.add(cityGroup);
  scene.add(rainGroup);

  createRoad();
  createPlayer();
  createDrone();
  createCity();
  createRain();
  createSkySymbols();

  window.addEventListener("resize", onResize);
}

function createRoad() {
  const roadBaseMat = new THREE.MeshBasicMaterial({
    color: 0x123c79
  });

  const laneFloorMat = new THREE.MeshBasicMaterial({
    color: 0x071d45
  });

  const cyanMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff
  });

  const goldMat = new THREE.MeshBasicMaterial({
    color: 0xffd166
  });

  const purpleMat = new THREE.MeshBasicMaterial({
    color: 0x8f2cff
  });

  for (let i = 0; i < ROAD_TILE_COUNT; i++) {
    const tile = new THREE.Group();

    /*
      IMPORTANT FIX:
      Tile itself moves on Z.
      Children stay around local z = 0.
      This prevents road placement bugs.
    */
    tile.position.z = -i * TILE_DEPTH;

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.18, TILE_DEPTH),
      roadBaseMat
    );
    base.position.set(0, -0.08, 0);
    tile.add(base);

    const leftLaneFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.05, TILE_DEPTH - 0.25),
      laneFloorMat
    );
    leftLaneFloor.position.set(-3, 0.02, 0);
    tile.add(leftLaneFloor);

    const middleLaneFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.05, TILE_DEPTH - 0.25),
      laneFloorMat
    );
    middleLaneFloor.position.set(0, 0.025, 0);
    tile.add(middleLaneFloor);

    const rightLaneFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.05, TILE_DEPTH - 0.25),
      laneFloorMat
    );
    rightLaneFloor.position.set(3, 0.02, 0);
    tile.add(rightLaneFloor);

    const leftDivider = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.09, TILE_DEPTH - 0.6),
      cyanMat
    );
    leftDivider.position.set(-1.5, 0.14, 0);
    tile.add(leftDivider);

    const rightDivider = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.09, TILE_DEPTH - 0.6),
      cyanMat
    );
    rightDivider.position.set(1.5, 0.14, 0);
    tile.add(rightDivider);

    const leftEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, TILE_DEPTH - 0.4),
      purpleMat
    );
    leftEdge.position.set(-5.25, 0.18, 0);
    tile.add(leftEdge);

    const rightEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, TILE_DEPTH - 0.4),
      purpleMat
    );
    rightEdge.position.set(5.25, 0.18, 0);
    tile.add(rightEdge);

    const centerDash = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.11, 2.2),
      goldMat
    );
    centerDash.position.set(0, 0.18, 0);
    tile.add(centerDash);

    if (i % 3 === 0) {
      const mandala = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.035, 12, 48),
        goldMat
      );
      mandala.position.set(0, 0.24, 0);
      mandala.rotation.x = Math.PI / 2;
      tile.add(mandala);
    }

    roadTiles.push(tile);
    roadGroup.add(tile);
  }
}

function createPlayer() {
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0b3b7a,
    metalness: 0.45,
    roughness: 0.2,
    emissive: 0x003b85,
    emissiveIntensity: 0.8
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff
  });

  const goldMat = new THREE.MeshBasicMaterial({
    color: 0xffd166
  });

  player = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.45, 0.45), bodyMat);
  body.position.y = 1.35;
  body.castShadow = true;
  player.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), bodyMat);
  head.position.y = 2.25;
  head.castShadow = true;
  player.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.06), glowMat);
  visor.position.set(0, 2.28, 0.31);
  player.add(visor);

  const chestGlow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.06), glowMat);
  chestGlow.position.set(0, 1.42, 0.27);
  player.add(chestGlow);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.18), bodyMat);
  leftArm.position.set(-0.52, 1.25, 0);
  player.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.52;
  player.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), bodyMat);
  leftLeg.position.set(-0.22, 0.42, 0);
  player.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.22;
  player.add(rightLeg);

  suryaCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    goldMat
  );
  suryaCore.position.set(0, 1.45, 0.38);
  player.add(suryaCore);

  const coreLight = new THREE.PointLight(0xffd166, 4, 16);
  coreLight.position.set(0, 1.45, 0.6);
  player.add(coreLight);

  const suitLight = new THREE.PointLight(0x00f5ff, 2.8, 12);
  suitLight.position.set(0, 1.4, 0.2);
  player.add(suitLight);

  player.position.set(lanes[currentLane], 0, 0);
  scene.add(player);
}

function createDrone() {
  drone = new THREE.Group();

  const droneMat = new THREE.MeshStandardMaterial({
    color: 0x090909,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0xff0033,
    emissiveIntensity: 0.9
  });

  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), droneMat);
  drone.add(body);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xff0033 })
  );
  eye.position.set(0, 0, 0.32);
  drone.add(eye);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.06, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xff0033 })
  );
  leftWing.position.set(-0.45, 0, 0);
  drone.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x = 0.45;
  drone.add(rightWing);

  const droneLight = new THREE.PointLight(0xff0033, 2, 10);
  droneLight.position.set(0, 0, 0.4);
  drone.add(droneLight);

  drone.position.set(2.8, 3.3, 1.8);
  drone.scale.set(0.85, 0.85, 0.85);

  scene.add(drone);
}

function createCity() {
  const buildingMats = [
    new THREE.MeshStandardMaterial({
      color: 0x10152d,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x001144,
      emissiveIntensity: 0.95
    }),
    new THREE.MeshStandardMaterial({
      color: 0x160b2e,
      metalness: 0.5,
      roughness: 0.25,
      emissive: 0x230044,
      emissiveIntensity: 0.95
    }),
    new THREE.MeshStandardMaterial({
      color: 0x07142f,
      metalness: 0.45,
      roughness: 0.25,
      emissive: 0x001f3f,
      emissiveIntensity: 0.85
    })
  ];

  const cyanWindowMat = new THREE.MeshBasicMaterial({ color: 0x00eaff });
  const goldWindowMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

  for (let i = 0; i < 70; i++) {
    const building = new THREE.Group();

    const side = Math.random() > 0.5 ? 1 : -1;
    const height = 3 + Math.random() * 10;
    const width = 1.3 + Math.random() * 2.2;
    const depth = 1.3 + Math.random() * 2.2;

    building.position.set(
      side * (7 + Math.random() * 8),
      0,
      -10 - Math.random() * 220
    );

    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMats[i % buildingMats.length]
    );
    tower.position.y = height / 2;
    building.add(tower);

    for (let j = 0; j < 5; j++) {
      const windowLine = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.75, 0.06, 0.04),
        j % 2 === 0 ? cyanWindowMat : goldWindowMat
      );

      windowLine.position.set(0, 1 + j * 1.35, depth / 2 + 0.04);
      building.add(windowLine);
    }

    const topRing = new THREE.Mesh(
      new THREE.TorusGeometry(width * 0.36, 0.025, 10, 28),
      goldWindowMat
    );
    topRing.position.set(0, height + 0.25, 0);
    topRing.rotation.x = Math.PI / 2;
    building.add(topRing);

    buildings.push(building);
    cityGroup.add(building);
  }
}

function createRain() {
  const rainMat = new THREE.MeshBasicMaterial({
    color: 0x8feaff,
    transparent: true,
    opacity: 0.55
  });

  for (let i = 0; i < 180; i++) {
    const drop = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.55, 0.025), rainMat);

    drop.position.set(
      (Math.random() - 0.5) * 28,
      Math.random() * 14,
      -Math.random() * 130
    );

    rainDrops.push(drop);
    rainGroup.add(drop);
  }
}

function createSkySymbols() {
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

  for (let i = 0; i < 15; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.035, 12, 48),
      i % 2 === 0 ? goldMat : cyanMat
    );

    ring.position.set(
      (Math.random() - 0.5) * 18,
      5 + Math.random() * 7,
      -20 - i * 16
    );

    ring.rotation.x = Math.PI / 2;
    cityGroup.add(ring);
  }
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const type = Math.random();

  let obstacle;

  if (type < 0.45) {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 1.45, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0033 })
    );
    obstacle.userData.type = "block";
    obstacle.position.y = 0.8;
  } else if (type < 0.75) {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.55, 1),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    obstacle.userData.type = "low";
    obstacle.position.y = 0.5;
  } else {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(2.25, 0.3, 1),
      new THREE.MeshBasicMaterial({ color: 0xb14cff })
    );
    obstacle.userData.type = "slide";
    obstacle.position.y = 2.05;
  }

  obstacle.position.x = lanes[lane];
  obstacle.position.z = -105;

  obstacles.push(obstacle);
  obstacleGroup.add(obstacle);
}

function spawnShard() {
  const lane = Math.floor(Math.random() * 3);

  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
  );

  const shardLight = new THREE.PointLight(0xffd166, 1.4, 4);
  shard.add(shardLight);

  shard.position.set(lanes[lane], 1.2 + Math.random() * 0.8, -105);

  shardItems.push(shard);
  shardGroup.add(shard);
}

function moveLeft() {
  if (!gameRunning || gamePaused) return;
  currentLane = Math.max(0, currentLane - 1);
}

function moveRight() {
  if (!gameRunning || gamePaused) return;
  currentLane = Math.min(2, currentLane + 1);
}

function jump() {
  if (!gameRunning || gamePaused) return;

  if (!isJumping) {
    velocityY = 0.78;
    isJumping = true;
  }
}

function slide() {
  if (!gameRunning || gamePaused) return;

  isSliding = true;
  slideTimer = 34;
  player.scale.y = 0.55;
}

function dash() {
  if (!gameRunning || gamePaused) return;

  speed += 0.18;

  if (abilityText) {
    abilityText.textContent = "Surya Dash Activated";
  }

  setTimeout(() => {
    if (abilityText) {
      abilityText.textContent = "Surya Dash Ready";
    }
  }, 900);
}

function updateGame() {
  if (!gameRunning || gamePaused || gameOver) return;

  distance += speed;
  speed += 0.00015;

  distanceText.textContent = Math.floor(distance);
  shardsText.textContent = shards;

  player.position.x += (lanes[currentLane] - player.position.x) * 0.18;

  if (isJumping) {
    playerY += velocityY;
    velocityY += gravity;

    if (playerY <= 1) {
      playerY = 1;
      velocityY = 0;
      isJumping = false;
    }
  }

  player.position.y = playerY - 1;

  if (isSliding) {
    slideTimer--;

    if (slideTimer <= 0) {
      isSliding = false;
      player.scale.y = 1;
    }
  }

  suryaCore.rotation.y += 0.08;
  suryaCore.rotation.x += 0.04;

  drone.position.x += (player.position.x + 2.6 - drone.position.x) * 0.035;
  drone.position.y = 3.3 + Math.sin(Date.now() * 0.006) * 0.18;
  drone.position.z = 1.8;
  drone.rotation.y += 0.04;

  for (let tile of roadTiles) {
    tile.position.z += speed;

    if (tile.position.z > 12) {
      tile.position.z -= ROAD_LOOP_DISTANCE;
    }
  }

  for (let building of buildings) {
    building.position.z += speed * 0.65;

    if (building.position.z > 30) {
      building.position.z -= 240;
    }
  }

  for (let drop of rainDrops) {
    drop.position.z += speed * 1.8;
    drop.position.y -= 0.35;

    if (drop.position.y < 0 || drop.position.z > 12) {
      drop.position.y = 8 + Math.random() * 8;
      drop.position.z = -100 - Math.random() * 60;
      drop.position.x = (Math.random() - 0.5) * 28;
    }
  }

  spawnTimer++;
  shardTimer++;

  if (spawnTimer > Math.max(45, 110 - distance / 80)) {
    spawnObstacle();
    spawnTimer = 0;
  }

  if (shardTimer > 28) {
    spawnShard();
    shardTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.position.z += speed;

    if (obs.position.z > 8) {
      obstacleGroup.remove(obs);
      obstacles.splice(i, 1);
      continue;
    }

    if (Math.abs(obs.position.z - player.position.z) < 0.9) {
      if (Math.abs(obs.position.x - player.position.x) < 0.9) {
        if (obs.userData.type === "slide") {
          if (!isSliding) endGame();
        } else if (obs.userData.type === "low") {
          if (!isJumping) endGame();
        } else {
          endGame();
        }
      }
    }
  }

  for (let i = shardItems.length - 1; i >= 0; i--) {
    const shard = shardItems[i];

    shard.position.z += speed;
    shard.rotation.y += 0.08;
    shard.rotation.x += 0.05;

    if (shard.position.z > 8) {
      shardGroup.remove(shard);
      shardItems.splice(i, 1);
      continue;
    }

    const dx = Math.abs(shard.position.x - player.position.x);
    const dy = Math.abs(shard.position.y - (player.position.y + 1.3));
    const dz = Math.abs(shard.position.z - player.position.z);

    if (dx < 0.9 && dy < 1.2 && dz < 1) {
      shards++;
      shardGroup.remove(shard);
      shardItems.splice(i, 1);
    }
  }

  if (Math.floor(distance) > 0 && Math.floor(distance) % 1000 < 4) {
    missionText.textContent = "Maharakshak Titan Signal Detected";
  } else if (Math.floor(distance) > 500 && Math.floor(distance) % 500 < 4) {
    missionText.textContent = "Trinetra Drone is learning your speed";
  } else {
    missionText.textContent = "Protect the Surya Core";
  }

  /*
    IMPORTANT CAMERA FIX:
    Camera now looks lower at the road, not only at the player.
    This makes the track visible.
  */
  camera.position.x += (player.position.x * 0.3 - camera.position.x) * 0.08;
  camera.position.y = 5.2;
  camera.position.z = 9.2;
  camera.lookAt(player.position.x, 0.45, -13);
}

function animate() {
  if (!gameRunning) return;

  animationId = requestAnimationFrame(animate);
  updateGame();

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function endGame() {
  if (gameOver) return;

  gameOver = true;
  gameRunning = false;

  const finalDistance = Math.floor(distance);

  if (finalDistance > highScore) {
    highScore = finalDistance;
    localStorage.setItem("velocityRunnerHighScore", highScore);
  }

  finalDistanceText.textContent = finalDistance;
  finalShardsText.textContent = shards;
  highScoreText.textContent = highScore;

  showScreen(gameOverScreen);
}

function goHome() {
  gameRunning = false;
  gamePaused = false;
  gameOver = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  showScreen(homeScreen);
}

function togglePause() {
  if (!gameRunning || gameOver) return;

  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? "Resume" : "Pause";

  if (!gamePaused) {
    animate();
  }
}

function onResize() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") moveLeft();
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") moveRight();
  if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") jump();
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") slide();
  if (e.key === "Shift") dash();
});

let touchStartX = 0;
let touchStartY = 0;
let lastTap = 0;

document.addEventListener("touchstart", function (e) {
  const t = e.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;

  const now = Date.now();

  if (now - lastTap < 300) {
    dash();
  }

  lastTap = now;
});

document.addEventListener("touchend", function (e) {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 40) moveRight();
    if (dx < -40) moveLeft();
  } else {
    if (dy < -40) jump();
    if (dy > 40) slide();
  }
});

if (pauseBtn) {
  pauseBtn.addEventListener("click", togglePause);
}

if (restartBtn) {
  restartBtn.addEventListener("click", startGame);
}

if (homeBtn) {
  homeBtn.addEventListener("click", goHome);
}
