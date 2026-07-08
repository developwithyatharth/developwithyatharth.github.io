/* Velocity Runner: Rise of Bharat
   Updated script.js
   Fixes:
   - Brighter road
   - Drone no longer blocks camera
   - Better runner camera
   - Stable neon lighting
   - Bharat-style glowing mandala road marks
*/

let scene, camera, renderer;
let player, suryaCore, drone;
let roadGroup, obstacleGroup, shardGroup, cityGroup, rainGroup;

let gameRunning = false;
let gamePaused = false;
let gameOver = false;

let runnerName = "Aarav Astra";
let currentLane = 1;
let lanes = [-3, 0, 3];

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

  if (renderer) {
    renderer.dispose();
  }

  initThree();
  animate();
}

window.startGame = startGame;

function initThree() {
  const canvas = document.getElementById("gameCanvas");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02030a);
  scene.fog = new THREE.FogExp2(0x05081a, 0.018);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 4.1, 7.2);
  camera.lookAt(0, 1.35, -9);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const ambient = new THREE.AmbientLight(0x8fdcff, 1.35);
  scene.add(ambient);

  const bharatGlow = new THREE.HemisphereLight(0x00eaff, 0xffaa00, 1.5);
  scene.add(bharatGlow);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.35);
  mainLight.position.set(5, 12, 8);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const neonLight1 = new THREE.PointLight(0x00eaff, 3.2, 45);
  neonLight1.position.set(-5, 5, -5);
  scene.add(neonLight1);

  const neonLight2 = new THREE.PointLight(0xff2aff, 3.2, 45);
  neonLight2.position.set(5, 5, -18);
  scene.add(neonLight2);

  const goldenLight = new THREE.PointLight(0xffd166, 3, 42);
  goldenLight.position.set(0, 6, -30);
  scene.add(goldenLight);

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

  createPlayer();
  createDrone();
  createRoad();
  createCity();
  createRain();
  createSkySymbols();

  window.addEventListener("resize", onResize);
}

function createPlayer() {
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0b132b,
    metalness: 0.45,
    roughness: 0.22,
    emissive: 0x002244,
    emissiveIntensity: 0.85
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff
  });

  player = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.45), bodyMat);
  body.position.y = 1.4;
  body.castShadow = true;
  player.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), bodyMat);
  head.position.y = 2.35;
  head.castShadow = true;
  player.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.05), glowMat);
  visor.position.set(0, 2.38, 0.31);
  player.add(visor);

  const chestGlow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.05), glowMat);
  chestGlow.position.set(0, 1.45, 0.26);
  player.add(chestGlow);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), bodyMat);
  leftLeg.position.set(-0.22, 0.45, 0);
  player.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.22;
  player.add(rightLeg);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.18), bodyMat);
  leftArm.position.set(-0.55, 1.35, 0);
  player.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.55;
  player.add(rightArm);

  suryaCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffd166
    })
  );

  suryaCore.position.set(0, 1.55, 0.38);
  player.add(suryaCore);

  const coreLight = new THREE.PointLight(0xffd166, 3.8, 14);
  coreLight.position.set(0, 1.55, 0.6);
  player.add(coreLight);

  const suitLight = new THREE.PointLight(0x00f5ff, 2.4, 9);
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
    emissiveIntensity: 0.8
  });

  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), droneMat);
  body.castShadow = true;
  drone.add(body);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff0033
    })
  );

  eye.position.set(0, 0, 0.32);
  drone.add(eye);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.06, 0.18),
    new THREE.MeshBasicMaterial({
      color: 0xff0033
    })
  );

  leftWing.position.set(-0.45, 0, 0);
  drone.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x = 0.45;
  drone.add(rightWing);

  const droneLight = new THREE.PointLight(0xff0033, 1.8, 8);
  droneLight.position.set(0, 0, 0.4);
  drone.add(droneLight);

  drone.position.set(2.8, 3.4, 1.8);
  drone.scale.set(0.9, 0.9, 0.9);

  scene.add(drone);
}

function createRoad() {
  const roadMat = new THREE.MeshBasicMaterial({
    color: 0x07142f
  });

  const laneMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff
  });

  const goldenMat = new THREE.MeshBasicMaterial({
    color: 0xffd166
  });

  const sideMat = new THREE.MeshBasicMaterial({
    color: 0x7b2cff
  });

  for (let i = 0; i < 26; i++) {
    const tile = new THREE.Group();

    const road = new THREE.Mesh(new THREE.BoxGeometry(10, 0.18, 8), roadMat);
    road.position.set(0, 0, -i * 8);
    tile.add(road);

    const leftLane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 7), laneMat);
    leftLane.position.set(-1.5, 0.14, -i * 8);
    tile.add(leftLane);

    const rightLane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 7), laneMat);
    rightLane.position.set(1.5, 0.14, -i * 8);
    tile.add(rightLane);

    const centerGlow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 7), goldenMat);
    centerGlow.position.set(0, 0.16, -i * 8);
    tile.add(centerGlow);

    const leftEdge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 7.5), sideMat);
    leftEdge.position.set(-5, 0.2, -i * 8);
    tile.add(leftEdge);

    const rightEdge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 7.5), sideMat);
    rightEdge.position.set(5, 0.2, -i * 8);
    tile.add(rightEdge);

    if (i % 3 === 0) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.035, 12, 48),
        goldenMat
      );

      ring.position.set(0, 0.23, -i * 8);
      ring.rotation.x = Math.PI / 2;
      tile.add(ring);
    }

    roadTiles.push(tile);
    roadGroup.add(tile);
  }
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
      emissiveIntensity: 0.8
    })
  ];

  const windowMat = new THREE.MeshBasicMaterial({
    color: 0x00eaff
  });

  const goldWindowMat = new THREE.MeshBasicMaterial({
    color: 0xffd166
  });

  for (let i = 0; i < 65; i++) {
    const side = Math.random() > 0.5 ? 1 : -1;
    const height = 3 + Math.random() * 9;
    const width = 1.3 + Math.random() * 2.2;
    const depth = 1.3 + Math.random() * 2.2;

    const building = new THREE.Group();

    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMats[i % buildingMats.length]
    );

    tower.position.set(side * (7 + Math.random() * 8), height / 2, -Math.random() * 190);
    tower.castShadow = true;
    building.add(tower);

    for (let j = 0; j < 5; j++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.72, 0.06, 0.035),
        j % 2 === 0 ? windowMat : goldWindowMat
      );

      win.position.set(
        tower.position.x,
        1 + j * 1.35,
        tower.position.z + depth / 2 + 0.03
      );

      building.add(win);
    }

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(width * 0.35, 0.025, 10, 28),
      goldWindowMat
    );

    ring.position.set(tower.position.x, height + 0.3, tower.position.z);
    ring.rotation.x = Math.PI / 2;
    building.add(ring);

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
      -Math.random() * 120
    );

    rainDrops.push(drop);
    rainGroup.add(drop);
  }
}

function createSkySymbols() {
  const symbolMat = new THREE.MeshBasicMaterial({
    color: 0xffd166
  });

  const cyanMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff
  });

  for (let i = 0; i < 14; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.035, 12, 48),
      i % 2 === 0 ? symbolMat : cyanMat
    );

    ring.position.set(
      (Math.random() - 0.5) * 20,
      5 + Math.random() * 7,
      -15 - i * 15
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
      new THREE.BoxGeometry(1.4, 1.5, 1),
      new THREE.MeshStandardMaterial({
        color: 0xff0033,
        emissive: 0xff0033,
        emissiveIntensity: 2
      })
    );

    obstacle.userData.type = "block";
    obstacle.position.y = 0.85;
  } else if (type < 0.75) {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.55, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffd166
      })
    );

    obstacle.userData.type = "low";
    obstacle.position.y = 0.55;
  } else {
    obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.28, 1),
      new THREE.MeshBasicMaterial({
        color: 0xb14cff
      })
    );

    obstacle.userData.type = "slide";
    obstacle.position.y = 2.05;
  }

  obstacle.position.x = lanes[lane];
  obstacle.position.z = -95;
  obstacle.castShadow = true;

  obstacles.push(obstacle);
  obstacleGroup.add(obstacle);
}

function spawnShard() {
  const lane = Math.floor(Math.random() * 3);

  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28),
    new THREE.MeshBasicMaterial({
      color: 0xffd166
    })
  );

  const shardLight = new THREE.PointLight(0xffd166, 1.5, 4);
  shard.add(shardLight);

  shard.position.set(lanes[lane], 1.15 + Math.random() * 1.1, -95);
  shard.userData.collected = false;

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

    if (tile.position.z > 10) {
      tile.position.z -= 208;
    }
  }

  for (let building of buildings) {
    building.position.z += speed * 0.65;

    if (building.position.z > 25) {
      building.position.z -= 205;
    }
  }

  for (let drop of rainDrops) {
    drop.position.z += speed * 1.8;
    drop.position.y -= 0.35;

    if (drop.position.y < 0 || drop.position.z > 12) {
      drop.position.y = 8 + Math.random() * 8;
      drop.position.z = -90 - Math.random() * 50;
      drop.position.x = (Math.random() - 0.5) * 28;
    }
  }

  spawnTimer++;
  shardTimer++;

  if (spawnTimer > Math.max(45, 110 - distance / 80)) {
    spawnObstacle();
    spawnTimer = 0;
  }

  if (shardTimer > 25) {
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

  camera.position.x += (player.position.x * 0.35 - camera.position.x) * 0.08;
  camera.position.y = 4.1;
  camera.position.z = 7.2;
  camera.lookAt(player.position.x, 1.35, -9);
}

function animate() {
  if (!gameRunning) return;

  requestAnimationFrame(animate);
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
