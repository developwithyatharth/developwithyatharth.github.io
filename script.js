/* Velocity Runner: Rise of Bharat
   Full Integrated script.js
   Systems included:
   - 3D endless runner
   - Three lanes
   - Jump / Slide / Dash
   - Shoot with F and Shoot button
   - Drone chase
   - Drone destroy + respawn
   - Drone EMP attack
   - Core Health
   - Shield Power-Up
   - Repair Power-Up
   - Boss event every 1000 meters
   - Boss laser attack
   - Boss health bar
*/

let scene, camera, renderer;
let player, suryaCore, drone, boss;

let roadGroup;
let obstacleGroup;
let shardGroup;
let cityGroup;
let rainGroup;
let bulletGroup;
let empGroup;

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

let coreHealth = 100;
let invincibleTimer = 0;
let shieldActive = false;

let obstacles = [];
let shardItems = [];
let roadTiles = [];
let buildings = [];
let rainDrops = [];
let bullets = [];
let explosions = [];
let empShots = [];
let bossLasers = [];
let powerUps = [];

let spawnTimer = 0;
let shardTimer = 0;
let powerUpTimer = 0;

let droneAlive = true;
let droneRespawnTimer = 0;
let dronesDestroyed = 0;
let droneShootTimer = 130;

let bossActive = false;
let bossHealth = 100;
let bossMaxHealth = 100;
let nextBossDistance = 1000;
let bossAttackTimer = 90;

let shootCooldown = 0;
const SHOOT_COOLDOWN_MAX = 38;

let messageTimer = 0;

const TILE_DEPTH = 8;
const ROAD_TILE_COUNT = 34;
const ROAD_LOOP_DISTANCE = TILE_DEPTH * ROAD_TILE_COUNT;

/* DOM Elements */

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const runnerNameInput = document.getElementById("runnerNameInput");
const runnerNameText = document.getElementById("runnerName");
const distanceText = document.getElementById("distance");
const shardsText = document.getElementById("shards");
const highScoreText = document.getElementById("highScore");
const coreHealthText = document.getElementById("coreHealth");
const shieldStatusText = document.getElementById("shieldStatus");

const finalDistanceText = document.getElementById("finalDistance");
const finalShardsText = document.getElementById("finalShards");
const abilityText = document.getElementById("abilityText");
const missionText = document.getElementById("missionText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const shootBtn = document.getElementById("shootBtn");

const bossUI = document.getElementById("bossUI");
const bossHealthFill = document.getElementById("bossHealthFill");

if (highScoreText) {
  highScoreText.textContent = highScore;
}

/* Screen Helper */

function showScreen(screen) {
  if (!homeScreen || !gameScreen || !gameOverScreen) return;

  homeScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");

  screen.classList.add("active");
}

function setMission(text, timer = 90) {
  if (!missionText) return;

  missionText.textContent = text;
  messageTimer = timer;
}

/* Start Game */

function startGame() {
  if (typeof THREE === "undefined") {
    alert("Three.js is not loading. Check the Three.js CDN script in index.html.");
    return;
  }

  runnerName =
    runnerNameInput && runnerNameInput.value.trim()
      ? runnerNameInput.value.trim()
      : "Aarav Astra";

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

  coreHealth = 100;
  invincibleTimer = 0;
  shieldActive = false;

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
  bullets = [];
  explosions = [];
  empShots = [];
  bossLasers = [];
  powerUps = [];

  spawnTimer = 0;
  shardTimer = 0;
  powerUpTimer = 0;

  droneAlive = true;
  droneRespawnTimer = 0;
  dronesDestroyed = 0;
  droneShootTimer = 130;

  bossActive = false;
  bossHealth = 100;
  bossMaxHealth = 100;
  nextBossDistance = 1000;
  bossAttackTimer = 90;

  shootCooldown = 0;
  messageTimer = 0;

  updateShootButton();
  updateCoreHealth();
  updateShieldStatus();
  updateBossUI();

  initThree();
  animate();
}

window.startGame = startGame;

/* Three.js Setup */

function initThree() {
  const canvas = document.getElementById("gameCanvas");

  if (!canvas) {
    alert("gameCanvas not found in index.html");
    return;
  }

  if (renderer) {
    renderer.dispose();
  }

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
  bulletGroup = new THREE.Group();
  empGroup = new THREE.Group();

  scene.add(roadGroup);
  scene.add(obstacleGroup);
  scene.add(shardGroup);
  scene.add(cityGroup);
  scene.add(rainGroup);
  scene.add(bulletGroup);
  scene.add(empGroup);

  createRoad();
  createPlayer();
  createDrone();
  createBoss();
  createCity();
  createRain();
  createSkySymbols();

  window.addEventListener("resize", onResize);
}

/* World */

function createRoad() {
  const roadBaseMat = new THREE.MeshBasicMaterial({ color: 0x123c79 });
  const laneFloorMat = new THREE.MeshBasicMaterial({ color: 0x071d45 });
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const purpleMat = new THREE.MeshBasicMaterial({ color: 0x8f2cff });

  for (let i = 0; i < ROAD_TILE_COUNT; i++) {
    const tile = new THREE.Group();
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
    const drop = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.55, 0.025),
      rainMat
    );

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

/* Player */

function createPlayer() {
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0b3b7a,
    metalness: 0.45,
    roughness: 0.2,
    emissive: 0x003b85,
    emissiveIntensity: 0.8
  });

  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

  player = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.45, 0.45),
    bodyMat
  );
  body.position.y = 1.35;
  body.castShadow = true;
  player.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 24, 24),
    bodyMat
  );
  head.position.y = 2.25;
  head.castShadow = true;
  player.add(head);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.08, 0.06),
    glowMat
  );
  visor.position.set(0, 2.28, 0.31);
  player.add(visor);

  const chestGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.85, 0.06),
    glowMat
  );
  chestGlow.position.set(0, 1.42, 0.27);
  player.add(chestGlow);

  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.85, 0.18),
    bodyMat
  );
  leftArm.position.set(-0.52, 1.25, 0);
  player.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.52;
  player.add(rightArm);

  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.75, 0.22),
    bodyMat
  );
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

/* Drone */

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
  drone.visible = true;

  scene.add(drone);
}

function droneShootEMP() {
  if (!droneAlive || !player || !empGroup) return;

  const emp = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff2aff })
  );

  const empLight = new THREE.PointLight(0xff2aff, 2.6, 9);
  emp.add(empLight);

  emp.position.copy(drone.position);

  const target = new THREE.Vector3(
    player.position.x,
    player.position.y + 1.35,
    player.position.z
  );

  const direction = new THREE.Vector3().subVectors(target, emp.position).normalize();

  emp.userData.direction = direction;
  emp.userData.life = 110;

  empShots.push(emp);
  empGroup.add(emp);

  setMission("EMP fired by drone", 65);
}

function destroyDrone() {
  if (!droneAlive) return;

  droneAlive = false;
  drone.visible = false;
  droneRespawnTimer = 130;
  droneShootTimer = 130;
  dronesDestroyed++;

  shards += 5;

  setMission("Drone destroyed +5 Surya Shards", 100);

  if (abilityText) {
    abilityText.textContent = "Drone Down";
  }

  createExplosion(drone.position.x, drone.position.y, drone.position.z);

  setTimeout(() => {
    if (abilityText) {
      abilityText.textContent = "Surya Dash Ready";
    }
  }, 900);
}

function respawnDrone() {
  droneAlive = true;
  drone.visible = true;

  const side = Math.random() > 0.5 ? 1 : -1;
  drone.position.set(side * 2.8, 3.3, 1.8);

  droneShootTimer = Math.max(80, 145 - Math.floor(distance / 80));

  setMission("New drone incoming", 80);
}

/* Boss */

function createBoss() {
  boss = new THREE.Group();

  const bossMat = new THREE.MeshStandardMaterial({
    color: 0x180018,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0xff2aff,
    emissiveIntensity: 0.9
  });

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 3.8, 1),
    bossMat
  );
  body.position.y = 4.6;
  boss.add(body);

  const head = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.2),
    bossMat
  );
  head.position.y = 7.1;
  boss.add(head);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 24),
    eyeMat
  );
  eye.position.set(0, 7.1, 0.65);
  boss.add(eye);

  const core = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.08, 12, 48),
    coreMat
  );
  core.position.set(0, 4.6, 0.7);
  boss.add(core);

  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 3.2, 0.55),
    bossMat
  );
  leftArm.position.set(-2.5, 4.7, 0);
  leftArm.rotation.z = 0.25;
  boss.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 2.5;
  rightArm.rotation.z = -0.25;
  boss.add(rightArm);

  const bossLight = new THREE.PointLight(0xff2aff, 4, 40);
  bossLight.position.set(0, 5.5, 1);
  boss.add(bossLight);

  boss.position.set(0, 0, -28);
  boss.visible = false;

  scene.add(boss);
}

function startBossEvent() {
  if (bossActive) return;

  bossActive = true;
  bossHealth = bossMaxHealth;
  bossAttackTimer = 70;

  if (boss) {
    boss.visible = true;
    boss.position.set(0, 0, -28);
  }

  setMission("Boss Event: AI Guardian awakened", 120);
  updateBossUI();
}

function endBossEvent() {
  bossActive = false;
  nextBossDistance += 1000;
  shards += 15;

  if (boss) {
    boss.visible = false;
  }

  clearBossLasers();

  setMission("Boss defeated +15 Surya Shards", 140);
  updateBossUI();
}

function updateBossUI() {
  if (!bossUI || !bossHealthFill) return;

  if (bossActive) {
    bossUI.classList.add("active");
    const percent = Math.max(0, bossHealth / bossMaxHealth) * 100;
    bossHealthFill.style.width = percent + "%";
  } else {
    bossUI.classList.remove("active");
  }
}

function damageBoss(amount) {
  if (!bossActive) return;

  bossHealth = Math.max(0, bossHealth - amount);
  updateBossUI();

  if (boss) {
    createExplosion(boss.position.x, 5.4, boss.position.z + 0.8);
  }

  if (bossHealth <= 0) {
    endBossEvent();
  }
}

function bossLaserAttack() {
  if (!bossActive || !empGroup) return;

  const laneIndex = Math.floor(Math.random() * 3);
  const laneX = lanes[laneIndex];

  const warningMat = new THREE.MeshBasicMaterial({
    color: 0xff2aff,
    transparent: true,
    opacity: 0.75
  });

  const laser = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.16, 20),
    warningMat
  );

  laser.position.set(laneX, 0.35, -12);
  laser.userData.life = 80;
  laser.userData.damageFrame = 42;
  laser.userData.laneIndex = laneIndex;
  laser.userData.hasDamaged = false;

  bossLasers.push(laser);
  empGroup.add(laser);

  setMission("Boss laser incoming", 65);
}

function updateBoss() {
  if (!bossActive) return;

  if (boss) {
    boss.rotation.y = Math.sin(Date.now() * 0.001) * 0.15;
    boss.position.y = Math.sin(Date.now() * 0.002) * 0.25;
  }

  bossAttackTimer--;

  if (bossAttackTimer <= 0) {
    bossLaserAttack();
    bossAttackTimer = Math.max(45, 95 - Math.floor(distance / 120));
  }

  updateBossLasers();
}

function updateBossLasers() {
  for (let i = bossLasers.length - 1; i >= 0; i--) {
    const laser = bossLasers[i];

    laser.userData.life--;

    if (laser.userData.life < 42) {
      laser.material.opacity = 1;
      laser.scale.y = 2.2;
    }

    if (
      !laser.userData.hasDamaged &&
      laser.userData.life < laser.userData.damageFrame &&
      currentLane === laser.userData.laneIndex &&
      playerY <= 1.5
    ) {
      laser.userData.hasDamaged = true;
      damagePlayer(25);
    }

    if (laser.userData.life <= 0) {
      empGroup.remove(laser);
      bossLasers.splice(i, 1);
    }
  }
}

function clearBossLasers() {
  for (let i = bossLasers.length - 1; i >= 0; i--) {
    empGroup.remove(bossLasers[i]);
  }

  bossLasers = [];
}

/* Obstacles, Collectibles, Power-Ups */

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

function spawnPowerUp() {
  const lane = Math.floor(Math.random() * 3);
  const type = Math.random() > 0.5 ? "shield" : "repair";
  const color = type === "shield" ? 0x00f5ff : 0x30ff7a;

  const powerUp = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.34, 1),
    new THREE.MeshBasicMaterial({ color: color })
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.035, 12, 40),
    new THREE.MeshBasicMaterial({ color: color })
  );

  ring.rotation.x = Math.PI / 2;

  const light = new THREE.PointLight(color, 2.4, 8);

  powerUp.add(body);
  powerUp.add(ring);
  powerUp.add(light);

  powerUp.position.set(lanes[lane], 1.3, -105);
  powerUp.userData.type = type;

  powerUps.push(powerUp);
  shardGroup.add(powerUp);
}

/* Player Actions */

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

function shoot() {
  if (!gameRunning || gamePaused || gameOver) return;
  if (shootCooldown > 0) return;

  shootCooldown = SHOOT_COOLDOWN_MAX;
  updateShootButton();

  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
  );

  const bulletLight = new THREE.PointLight(0xffd166, 2.4, 8);
  bullet.add(bulletLight);

  bullet.position.set(
    player.position.x,
    player.position.y + 1.55,
    player.position.z + 0.35
  );

  bullet.userData.life = 70;

  bullets.push(bullet);
  bulletGroup.add(bullet);

  setMission("Shoot fired", 40);
}

function updateShootButton() {
  if (!shootBtn) return;

  if (shootCooldown > 0) {
    shootBtn.textContent = "Cooling";
    shootBtn.classList.add("cooling");
  } else {
    shootBtn.textContent = "Shoot";
    shootBtn.classList.remove("cooling");
  }
}

/* Health, Shield and Damage */

function updateCoreHealth() {
  if (!coreHealthText) return;

  coreHealthText.textContent = coreHealth;

  const parent = coreHealthText.parentElement;

  if (parent) {
    parent.classList.toggle("core-danger", coreHealth <= 40);
  }
}

function updateShieldStatus() {
  if (!shieldStatusText) return;

  shieldStatusText.textContent = shieldActive ? "Active" : "Empty";
}

function damagePlayer(amount) {
  if (invincibleTimer > 0 || gameOver) return;

  if (shieldActive) {
    shieldActive = false;
    updateShieldStatus();
    invincibleTimer = 45;
    createExplosion(player.position.x, player.position.y + 1.2, player.position.z);
    setMission("Shield absorbed damage", 90);
    return;
  }

  coreHealth = Math.max(0, coreHealth - amount);
  invincibleTimer = 75;
  updateCoreHealth();

  createExplosion(player.position.x, player.position.y + 1.2, player.position.z);
  setMission("Core damaged", 85);

  if (coreHealth <= 0) {
    endGame();
  }
}

/* Effects */

function createExplosion(x, y, z) {
  const colors = [0xff0033, 0xffd166, 0x00f5ff];

  for (let i = 0; i < 14; i++) {
    const piece = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 10),
      new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
    );

    piece.position.set(x, y, z);

    piece.userData.life = 24;
    piece.userData.vx = (Math.random() - 0.5) * 0.28;
    piece.userData.vy = (Math.random() - 0.5) * 0.28;
    piece.userData.vz = (Math.random() - 0.5) * 0.28;

    explosions.push(piece);
    bulletGroup.add(piece);
  }
}

/* Main Update Loop */

function updateGame() {
  if (!gameRunning || gamePaused || gameOver) return;

  distance += speed;
  speed += 0.00015;

  if (messageTimer > 0) {
    messageTimer--;
  }

  if (shootCooldown > 0) {
    shootCooldown--;
    updateShootButton();
  }

  if (invincibleTimer > 0) {
    invincibleTimer--;
    player.visible = Math.floor(invincibleTimer / 6) % 2 === 0;
  } else if (player) {
    player.visible = true;
  }

  if (distanceText) distanceText.textContent = Math.floor(distance);
  if (shardsText) shardsText.textContent = shards;

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

  updateDrone();
  updateMovingWorld();

  spawnTimer++;
  shardTimer++;
  powerUpTimer++;

  if (spawnTimer > Math.max(45, 110 - distance / 80)) {
    spawnObstacle();
    spawnTimer = 0;
  }

  if (shardTimer > 28) {
    spawnShard();
    shardTimer = 0;
  }

  if (powerUpTimer > 420) {
    spawnPowerUp();
    powerUpTimer = 0;
  }

  if (!bossActive && distance >= nextBossDistance) {
    startBossEvent();
  }

  updateBoss();
  updateBullets();
  updateEMPShots();
  updateExplosions();
  updateObstacles();
  updateShards();
  updatePowerUps();
  updateMissionText();

  camera.position.x += (player.position.x * 0.3 - camera.position.x) * 0.08;
  camera.position.y = 5.2;
  camera.position.z = 9.2;
  camera.lookAt(player.position.x, 0.45, -13);
}

function updateMovingWorld() {
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
}

function updateDrone() {
  if (droneAlive) {
    drone.position.x += (player.position.x + 2.6 - drone.position.x) * 0.035;
    drone.position.y = 3.3 + Math.sin(Date.now() * 0.006) * 0.18;
    drone.position.z = 1.8;
    drone.rotation.y += 0.04;

    droneShootTimer--;

    if (droneShootTimer <= 0) {
      droneShootEMP();
      droneShootTimer = Math.max(70, 150 - Math.floor(distance / 70));
    }
  } else {
    droneRespawnTimer--;

    if (droneRespawnTimer <= 0) {
      respawnDrone();
    }
  }
}

function updateBullets() {
  const targetVector = new THREE.Vector3();
  const direction = new THREE.Vector3();

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    bullet.userData.life--;
    bullet.rotation.y += 0.18;
    bullet.rotation.x += 0.12;

    if (bossActive && boss) {
      targetVector.set(boss.position.x, 5.2, boss.position.z + 0.8);
      direction.subVectors(targetVector, bullet.position).normalize();
      bullet.position.add(direction.multiplyScalar(0.78));

      if (bullet.position.distanceTo(targetVector) < 0.9) {
        bulletGroup.remove(bullet);
        bullets.splice(i, 1);
        damageBoss(12);
        continue;
      }
    } else if (droneAlive) {
      targetVector.set(drone.position.x, drone.position.y, drone.position.z);
      direction.subVectors(targetVector, bullet.position).normalize();
      bullet.position.add(direction.multiplyScalar(0.72));

      if (bullet.position.distanceTo(drone.position) < 0.55) {
        bulletGroup.remove(bullet);
        bullets.splice(i, 1);
        destroyDrone();
        continue;
      }
    } else {
      bullet.position.z -= 0.75;
    }

    if (bullet.userData.life <= 0) {
      bulletGroup.remove(bullet);
      bullets.splice(i, 1);
    }
  }
}

function updateEMPShots() {
  const playerHitPoint = new THREE.Vector3();

  for (let i = empShots.length - 1; i >= 0; i--) {
    const emp = empShots[i];

    emp.userData.life--;
    emp.rotation.y += 0.15;
    emp.rotation.x += 0.1;

    emp.position.add(emp.userData.direction.clone().multiplyScalar(0.2));

    playerHitPoint.set(
      player.position.x,
      player.position.y + 1.3,
      player.position.z
    );

    if (emp.position.distanceTo(playerHitPoint) < 0.65) {
      empGroup.remove(emp);
      empShots.splice(i, 1);
      damagePlayer(20);
      continue;
    }

    if (
      emp.userData.life <= 0 ||
      emp.position.y < -1 ||
      emp.position.y > 12 ||
      emp.position.z > 12 ||
      emp.position.z < -25
    ) {
      empGroup.remove(emp);
      empShots.splice(i, 1);
    }
  }
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const piece = explosions[i];

    piece.userData.life--;
    piece.position.x += piece.userData.vx;
    piece.position.y += piece.userData.vy;
    piece.position.z += piece.userData.vz;
    piece.scale.multiplyScalar(0.96);

    if (piece.userData.life <= 0) {
      bulletGroup.remove(piece);
      explosions.splice(i, 1);
    }
  }
}

function updateObstacles() {
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
}

function updateShards() {
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
}

function updatePowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const item = powerUps[i];

    item.position.z += speed;
    item.rotation.y += 0.08;

    if (item.position.z > 8) {
      shardGroup.remove(item);
      powerUps.splice(i, 1);
      continue;
    }

    const dx = Math.abs(item.position.x - player.position.x);
    const dy = Math.abs(item.position.y - (player.position.y + 1.3));
    const dz = Math.abs(item.position.z - player.position.z);

    if (dx < 0.9 && dy < 1.2 && dz < 1) {
      if (item.userData.type === "shield") {
        shieldActive = true;
        updateShieldStatus();
        setMission("Shield collected", 90);
      }

      if (item.userData.type === "repair") {
        coreHealth = Math.min(100, coreHealth + 25);
        updateCoreHealth();
        setMission("Core repaired +25", 90);
      }

      shardGroup.remove(item);
      powerUps.splice(i, 1);
    }
  }
}

function updateMissionText() {
  if (!missionText) return;
  if (messageTimer > 0) return;

  if (bossActive) {
    missionText.textContent = "Boss active: dodge lasers and shoot";
    return;
  }

  if (!droneAlive) return;

  if (droneShootTimer < 35) {
    missionText.textContent = "Warning: Drone EMP charging";
  } else if (Math.floor(distance) > 0 && Math.floor(distance) % 1000 < 4) {
    missionText.textContent = "Maharakshak Titan Signal Detected";
  } else if (Math.floor(distance) > 500 && Math.floor(distance) % 500 < 4) {
    missionText.textContent = "Trinetra Drone is learning your speed";
  } else {
    missionText.textContent = "Protect the Surya Core";
  }
}

/* Animation */

function animate() {
  if (!gameRunning) return;

  animationId = requestAnimationFrame(animate);
  updateGame();

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

/* Game State */

function endGame() {
  if (gameOver) return;

  gameOver = true;
  gameRunning = false;

  const finalDistance = Math.floor(distance);

  if (finalDistance > highScore) {
    highScore = finalDistance;
    localStorage.setItem("velocityRunnerHighScore", highScore);
  }

  if (player) {
    player.visible = true;
  }

  if (finalDistanceText) finalDistanceText.textContent = finalDistance;
  if (finalShardsText) finalShardsText.textContent = shards;
  if (highScoreText) highScoreText.textContent = highScore;

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

  if (pauseBtn) {
    pauseBtn.textContent = gamePaused ? "Resume" : "Pause";
  }
}

function onResize() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* Controls */

document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") moveLeft();
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") moveRight();
  if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") jump();
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") slide();
  if (e.key === "Shift") dash();
  if (e.key.toLowerCase() === "f") shoot();
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

/* Button Events */

if (startBtn) {
  startBtn.addEventListener("click", startGame);
}

if (pauseBtn) {
  pauseBtn.addEventListener("click", togglePause);
}

if (restartBtn) {
  restartBtn.addEventListener("click", startGame);
}

if (homeBtn) {
  homeBtn.addEventListener("click", goHome);
}

if (shootBtn) {
  shootBtn.addEventListener("click", shoot);
}

window.startGame = startGame;
