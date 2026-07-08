import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.querySelector('#gameCanvas');
const startScreen = document.querySelector('#startScreen');
const gameOverScreen = document.querySelector('#gameOverScreen');
const startBtn = document.querySelector('#startBtn');
const restartBtn = document.querySelector('#restartBtn');
const distanceEl = document.querySelector('#distance');
const shardsEl = document.querySelector('#shards');
const highScoreEl = document.querySelector('#highScore');
const speedLevelEl = document.querySelector('#speedLevel');
const coreBar = document.querySelector('#coreBar');
const slowBar = document.querySelector('#slowBar');
const warningEl = document.querySelector('#warning');
const slowBadge = document.querySelector('#slowBadge');
const finalDistanceEl = document.querySelector('#finalDistance');
const finalShardsEl = document.querySelector('#finalShards');
const finalHighEl = document.querySelector('#finalHigh');

const jumpBtn = document.querySelector('#jumpBtn');
const dashBtn = document.querySelector('#dashBtn');
const slowBtn = document.querySelector('#slowBtn');
const slideBtn = document.querySelector('#slideBtn');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020713);
scene.fog = new THREE.FogExp2(0x07142a, 0.018);

const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 650);
camera.position.set(0, 6.8, 12.5);
camera.lookAt(0, 2.2, -22);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.72, 0.56, 0.18);
composer.addPass(bloomPass);

const ambient = new THREE.AmbientLight(0x81b6ff, 1.2);
scene.add(ambient);

const moonLight = new THREE.DirectionalLight(0xcce9ff, 2.2);
moonLight.position.set(6, 20, 7);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 70;
moonLight.shadow.camera.left = -35;
moonLight.shadow.camera.right = 35;
moonLight.shadow.camera.top = 35;
moonLight.shadow.camera.bottom = -35;
scene.add(moonLight);

const goldLight = new THREE.PointLight(0xffc94a, 18, 42);
goldLight.position.set(0, 5.4, 1.2);
scene.add(goldLight);

const cyanLight = new THREE.PointLight(0x00f5ff, 14, 55);
cyanLight.position.set(-6, 7, -15);
scene.add(cyanLight);

const laneX = [-3.2, 0, 3.2];
const PLAYER_Z = 0;
const FAR_Z = -210;
const NEAR_Z = 20;

let clock = new THREE.Clock();
let running = false;
let gameEnded = false;
let highScore = Number(localStorage.getItem('velocityRunnerHighScore') || 0);
highScoreEl.textContent = highScore;

let distance = 0;
let shards = 0;
let speed = 24;
let coreEnergy = 100;
let slowEnergy = 55;
let currentLane = 1;
let targetLane = 1;
let verticalVelocity = 0;
let jumpCount = 0;
let slideTimer = 0;
let dashTimer = 0;
let invincibleTimer = 0;
let slowTimer = 0;
let spawnTimer = 0;
let shardTimer = 0;
let empTimer = 3;
let bossActive = false;
let bossTimer = 0;
let nextBossDistance = 1000;
let cameraShake = 0;
let lastPatternDistance = 0;

const dynamicObjects = [];
const obstacles = [];
const collectibles = [];
const roadSegments = [];
const cityPieces = [];
const billboards = [];
const rainDrops = [];
const pulseMaterials = [];

const materials = {
  road: new THREE.MeshStandardMaterial({ color: 0x071529, roughness: 0.42, metalness: 0.58 }),
  roadEdge: new THREE.MeshStandardMaterial({ color: 0x00f5ff, emissive: 0x00d9ff, emissiveIntensity: 1.9, roughness: 0.2, metalness: 0.2 }),
  laneGold: new THREE.MeshStandardMaterial({ color: 0xffcc55, emissive: 0xffa600, emissiveIntensity: 1.3, roughness: 0.25, metalness: 0.4 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x00eaff, emissive: 0x00d7ff, emissiveIntensity: 2.5, roughness: 0.25, metalness: 0.25 }),
  purple: new THREE.MeshStandardMaterial({ color: 0x9b55ff, emissive: 0x7a16ff, emissiveIntensity: 2.4, roughness: 0.24, metalness: 0.25 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffcc55, emissive: 0xffa400, emissiveIntensity: 2.2, roughness: 0.18, metalness: 0.35 }),
  danger: new THREE.MeshStandardMaterial({ color: 0xff2b62, emissive: 0xff004c, emissiveIntensity: 2.6, roughness: 0.25, metalness: 0.2 }),
  blackMetal: new THREE.MeshStandardMaterial({ color: 0x05080f, roughness: 0.2, metalness: 0.75 }),
  glassBlue: new THREE.MeshStandardMaterial({ color: 0x183d77, emissive: 0x06235a, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.65 }),
  playerSuit: new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.24, metalness: 0.62 }),
  playerNeon: new THREE.MeshStandardMaterial({ color: 0xffcc55, emissive: 0xffa400, emissiveIntensity: 2.9, roughness: 0.16, metalness: 0.3 })
};

pulseMaterials.push(materials.cyan, materials.purple, materials.gold, materials.danger, materials.playerNeon, materials.laneGold);

function createPlayer() {
  const group = new THREE.Group();
  group.position.set(laneX[currentLane], 0, PLAYER_Z);
  group.name = 'Aarav Astra';

  const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.25, 18), materials.playerSuit);
  lower.position.y = 0.72;
  lower.castShadow = true;
  group.add(lower);

  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.45, 1.35, 22), materials.playerSuit);
  upper.position.y = 1.82;
  upper.castShadow = true;
  group.add(upper);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), materials.blackMetal);
  head.position.y = 2.75;
  head.castShadow = true;
  group.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.13, 0.08), materials.cyan);
  visor.position.set(0, 2.79, 0.36);
  group.add(visor);

  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 16, 40), materials.gold);
  coreRing.position.set(0, 1.85, 0.52);
  coreRing.rotation.x = Math.PI / 2;
  coreRing.name = 'Surya Core';
  group.add(coreRing);

  const coreCenter = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 14), materials.gold);
  coreCenter.position.set(0, 1.85, 0.52);
  group.add(coreCenter);

  const chestLine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.05, 0.06), materials.playerNeon);
  chestLine.position.set(0, 1.78, 0.47);
  group.add(chestLine);

  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 1.15, 12), materials.playerSuit);
  leftArm.position.set(-0.62, 1.77, 0.04);
  leftArm.rotation.z = -0.24;
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.62;
  rightArm.rotation.z = 0.24;
  group.add(rightArm);

  const footGlowL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.82), materials.cyan);
  footGlowL.position.set(-0.25, 0.08, 0.1);
  group.add(footGlowL);

  const footGlowR = footGlowL.clone();
  footGlowR.position.x = 0.25;
  group.add(footGlowR);

  scene.add(group);
  return group;
}

const player = createPlayer();

function createDrone() {
  const group = new THREE.Group();
  group.position.set(0, 5.4, 7.8);

  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), materials.blackMetal);
  body.castShadow = true;
  group.add(body);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), materials.danger);
  eye.position.set(0, 0, -0.56);
  group.add(eye);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.035, 12, 48), materials.danger);
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);

  const wingGeo = new THREE.BoxGeometry(1.1, 0.08, 0.26);
  const wingL = new THREE.Mesh(wingGeo, materials.cyan);
  wingL.position.x = -1.1;
  group.add(wingL);
  const wingR = wingL.clone();
  wingR.position.x = 1.1;
  group.add(wingR);

  scene.add(group);
  return group;
}

const hunterDrone = createDrone();

function createGuardian() {
  const group = new THREE.Group();
  group.visible = false;
  group.position.set(0, 16, -96);

  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(4.4, 0), materials.blackMetal);
  head.castShadow = true;
  group.add(head);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 18), materials.danger);
  eye.position.set(0, 0.25, 3.58);
  group.add(eye);

  const trinetra = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.08, 16, 72), materials.gold);
  trinetra.position.set(0, 0.25, 3.65);
  group.add(trinetra);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(2.8, 2.6, 6), materials.purple);
  crown.position.y = 4.25;
  group.add(crown);

  const left = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 1.2), materials.blackMetal);
  left.position.set(-5.6, -4, 0);
  group.add(left);
  const right = left.clone();
  right.position.x = 5.6;
  group.add(right);

  scene.add(group);
  return group;
}

const guardian = createGuardian();

function createRoadSegment(z) {
  const group = new THREE.Group();
  group.position.z = z;

  const base = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.28, 24), materials.road);
  base.receiveShadow = true;
  group.add(base);

  const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 24), materials.roadEdge);
  edgeL.position.set(-5.8, 0.22, 0);
  group.add(edgeL);
  const edgeR = edgeL.clone();
  edgeR.position.x = 5.8;
  group.add(edgeR);

  for (const x of [-1.6, 1.6]) {
    const lane = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 10), materials.laneGold);
    lane.position.set(x, 0.26, -5.8);
    group.add(lane);
    const lane2 = lane.clone();
    lane2.position.z = 6.2;
    group.add(lane2);
  }

  const mandala = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.035, 12, 64), materials.gold);
  mandala.position.set(0, 0.31, 0);
  mandala.rotation.x = Math.PI / 2;
  group.add(mandala);

  scene.add(group);
  roadSegments.push(group);
}

for (let z = 12; z > FAR_Z; z -= 24) createRoadSegment(z);

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function createCityPiece(z) {
  const group = new THREE.Group();
  group.position.z = z;
  const side = Math.random() > 0.5 ? 1 : -1;
  group.position.x = side * randomRange(9, 22);

  const width = randomRange(2.2, 5.8);
  const depth = randomRange(3, 8);
  const height = randomRange(10, 34);
  const bodyMat = Math.random() > 0.52 ? materials.glassBlue : materials.blackMetal;
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
  body.position.y = height / 2 - 0.2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roofStyle = Math.random();
  if (roofStyle > 0.5) {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(width * 0.55, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), materials.purple);
    dome.position.y = height - 0.2;
    group.add(dome);
  } else {
    const spire = new THREE.Mesh(new THREE.ConeGeometry(width * 0.42, randomRange(2, 5), 5), materials.gold);
    spire.position.y = height + 1.2;
    group.add(spire);
  }

  const strips = Math.floor(randomRange(3, 8));
  for (let i = 0; i < strips; i++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(width + 0.03, 0.06, 0.05), Math.random() > 0.5 ? materials.cyan : materials.gold);
    strip.position.set(0, randomRange(1, height - 1), side > 0 ? -depth / 2 - 0.04 : depth / 2 + 0.04);
    group.add(strip);
  }

  scene.add(group);
  cityPieces.push(group);
}

for (let i = 0; i < 70; i++) createCityPiece(randomRange(FAR_Z, 25));

function makeBillboardTexture(text, accent = '#00f5ff') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 512, 256);
  grd.addColorStop(0, 'rgba(3,8,23,0.95)');
  grd.addColorStop(1, 'rgba(25,8,45,0.95)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 236);
  ctx.fillStyle = accent;
  ctx.font = '900 48px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = text.split('|');
  if (words.length > 1) {
    ctx.fillText(words[0], 256, 95);
    ctx.fillStyle = '#ffcc55';
    ctx.font = '800 38px system-ui, sans-serif';
    ctx.fillText(words[1], 256, 155);
  } else {
    ctx.fillText(text, 256, 128);
  }
  return new THREE.CanvasTexture(c);
}

const billboardTexts = ['भारत|NEO 2149', 'SURYA|CORE', 'त्रिनेत्र|ONLINE', 'RUN|FOR BHARAT', 'आर्यावर्त|GRID', 'AARAV|ASTRA'];

function createBillboard(z) {
  const group = new THREE.Group();
  const side = Math.random() > 0.5 ? 1 : -1;
  group.position.set(side * randomRange(8, 15), randomRange(5, 16), z);
  group.rotation.y = side > 0 ? -0.35 : 0.35;

  const text = billboardTexts[Math.floor(Math.random() * billboardTexts.length)];
  const accent = Math.random() > 0.5 ? '#00f5ff' : '#ffcc55';
  const texture = makeBillboardTexture(text, accent);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.7), mat);
  group.add(board);

  scene.add(group);
  billboards.push(group);
}

for (let i = 0; i < 20; i++) createBillboard(randomRange(FAR_Z, 10));

function createRain() {
  const geometry = new THREE.BufferGeometry();
  const count = 950;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = randomRange(-36, 36);
    positions[i * 3 + 1] = randomRange(0, 42);
    positions[i * 3 + 2] = randomRange(-210, 25);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x89eaff, size: 0.06, transparent: true, opacity: 0.48 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  rainDrops.push(points);
}
createRain();

function createSpeedLines() {
  const geometry = new THREE.BufferGeometry();
  const count = 90;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = randomRange(-8, 8);
    positions[i * 3 + 1] = randomRange(1.4, 8);
    positions[i * 3 + 2] = randomRange(-80, 6);
    const cyan = Math.random() > 0.5;
    colors[i * 3] = cyan ? 0 : 1;
    colors[i * 3 + 1] = cyan ? 0.95 : 0.72;
    colors[i * 3 + 2] = cyan ? 1 : 0.15;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.11, vertexColors: true, transparent: true, opacity: 0.65 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  dynamicObjects.push({ mesh: points, kind: 'speedLines' });
}
createSpeedLines();

function createShard(lane, z, y = 1.4) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], y, z);
  group.userData = { type: 'shard', size: { x: 0.82, y: 0.82, z: 0.82 }, collected: false };

  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), materials.gold);
  gem.castShadow = true;
  group.add(gem);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02, 8, 24), materials.cyan);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  scene.add(group);
  collectibles.push(group);
}

function createObstacle(type, lane, z) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], 0, z);
  group.userData = { type, size: { x: 1.35, y: 1.6, z: 1.2 }, hit: false, lane };

  if (type === 'lowBarrier') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.82, 1.15), materials.danger);
    base.position.y = 0.42;
    base.castShadow = true;
    group.add(base);
    const top = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.035, 10, 34), materials.gold);
    top.position.y = 1.02;
    top.rotation.x = Math.PI / 2;
    group.add(top);
    group.userData.size = { x: 1.6, y: 0.95, z: 1.2 };
  }

  if (type === 'highLaser') {
    const postGeo = new THREE.BoxGeometry(0.18, 2.55, 0.18);
    const p1 = new THREE.Mesh(postGeo, materials.blackMetal);
    p1.position.set(-0.9, 1.28, 0);
    p1.castShadow = true;
    group.add(p1);
    const p2 = p1.clone();
    p2.position.x = 0.9;
    group.add(p2);
    const laser = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.16, 0.22), materials.cyan);
    laser.position.y = 1.62;
    group.add(laser);
    const laser2 = laser.clone();
    laser2.position.y = 2.18;
    group.add(laser2);
    group.userData.size = { x: 2.0, y: 2.35, z: 0.7 };
  }

  if (type === 'block') {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.25, 1.55), materials.purple);
    block.position.y = 1.12;
    block.castShadow = true;
    block.receiveShadow = true;
    group.add(block);
    const symbol = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 12, 32), materials.gold);
    symbol.position.set(0, 1.2, 0.81);
    group.add(symbol);
    group.userData.size = { x: 1.85, y: 2.25, z: 1.55 };
  }

  if (type === 'empMine') {
    const mine = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.24, 24), materials.danger);
    mine.position.y = 0.14;
    mine.castShadow = true;
    group.add(mine);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 12), materials.cyan);
    eye.position.y = 0.42;
    group.add(eye);
    group.userData.size = { x: 1.3, y: 0.52, z: 1.3 };
  }

  if (type === 'jumpPad') {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.9, 0.18, 30), materials.gold);
    pad.position.y = 0.12;
    group.add(pad);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.68, 3), materials.cyan);
    arrow.position.y = 0.58;
    arrow.rotation.x = Math.PI;
    group.add(arrow);
    group.userData.size = { x: 1.55, y: 0.6, z: 1.55 };
  }

  if (type === 'bossLaser') {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.32, 1.2), materials.danger);
    beam.position.y = 1.08;
    group.add(beam);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.035, 10, 34), materials.danger);
    halo.position.y = 1.1;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
    group.userData.size = { x: 2.4, y: 1.28, z: 1.2 };
  }

  scene.add(group);
  obstacles.push(group);
}

function spawnShardLine() {
  const lane = Math.floor(Math.random() * 3);
  const startZ = FAR_Z;
  for (let i = 0; i < 7; i++) createShard(lane, startZ - i * 5, 1.35 + Math.sin(i) * 0.18);
}

function spawnObstaclePattern(forceBoss = false) {
  const z = FAR_Z - 4;
  const dangerTypes = forceBoss ? ['bossLaser', 'block', 'highLaser'] : ['lowBarrier', 'highLaser', 'block', 'empMine', 'jumpPad'];
  const openLane = Math.floor(Math.random() * 3);
  const count = forceBoss || Math.random() > 0.52 ? 2 : 1;
  const lanes = [0, 1, 2].filter(l => l !== openLane).sort(() => Math.random() - 0.5).slice(0, count);
  for (const lane of lanes) {
    const type = dangerTypes[Math.floor(Math.random() * dangerTypes.length)];
    createObstacle(type, lane, z + randomRange(-2, 8));
  }

  if (!forceBoss && distance - lastPatternDistance > 480 && Math.random() > 0.65) {
    lastPatternDistance = distance;
    for (let l = 0; l < 3; l++) {
      if (l !== openLane) createObstacle('empMine', l, z - 16 + randomRange(-1, 1));
    }
  }
}

function resetGame() {
  for (const obj of obstacles) scene.remove(obj);
  for (const obj of collectibles) scene.remove(obj);
  obstacles.length = 0;
  collectibles.length = 0;

  running = true;
  gameEnded = false;
  distance = 0;
  shards = 0;
  speed = 24;
  coreEnergy = 100;
  slowEnergy = 55;
  currentLane = 1;
  targetLane = 1;
  verticalVelocity = 0;
  jumpCount = 0;
  slideTimer = 0;
  dashTimer = 0;
  invincibleTimer = 0;
  slowTimer = 0;
  spawnTimer = 0.4;
  shardTimer = 1.2;
  empTimer = 3.5;
  bossActive = false;
  bossTimer = 0;
  nextBossDistance = 1000;
  cameraShake = 0;
  lastPatternDistance = 0;

  player.position.set(laneX[currentLane], 0, PLAYER_Z);
  player.scale.set(1, 1, 1);
  guardian.visible = false;
  warningEl.classList.add('hidden');
  slowBadge.classList.add('hidden');
  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  clock = new THREE.Clock();
  updateUI();
}

function endGame() {
  if (gameEnded) return;
  running = false;
  gameEnded = true;
  const finalDistance = Math.floor(distance);
  if (finalDistance > highScore) {
    highScore = finalDistance;
    localStorage.setItem('velocityRunnerHighScore', String(highScore));
  }
  finalDistanceEl.textContent = finalDistance;
  finalShardsEl.textContent = shards;
  finalHighEl.textContent = highScore;
  highScoreEl.textContent = highScore;
  gameOverScreen.classList.add('active');
}

function moveLane(dir) {
  if (!running) return;
  targetLane = THREE.MathUtils.clamp(targetLane + dir, 0, 2);
}

function jump() {
  if (!running) return;
  if (jumpCount < 2 && slideTimer <= 0) {
    verticalVelocity = jumpCount === 0 ? 12.6 : 10.2;
    jumpCount++;
    cameraShake = Math.max(cameraShake, 0.08);
  }
}

function slide() {
  if (!running) return;
  if (player.position.y < 0.12) {
    slideTimer = 0.78;
    cameraShake = Math.max(cameraShake, 0.05);
  }
}

function dash() {
  if (!running) return;
  if (dashTimer <= 0) {
    dashTimer = 0.42;
    invincibleTimer = Math.max(invincibleTimer, 0.18);
    cameraShake = Math.max(cameraShake, 0.16);
  }
}

function activateSlow() {
  if (!running) return;
  if (slowEnergy >= 18 && slowTimer <= 0) {
    slowTimer = 2.25;
    slowEnergy -= 18;
  }
}

function takeDamage(amount = 24) {
  if (invincibleTimer > 0 || !running) return;
  coreEnergy -= amount;
  invincibleTimer = 1.15;
  cameraShake = 0.42;
  materials.playerNeon.emissiveIntensity = 6;
  if (coreEnergy <= 0) {
    coreEnergy = 0;
    endGame();
  }
}

function playerBounds() {
  const sliding = slideTimer > 0;
  return {
    x: player.position.x,
    y: player.position.y + (sliding ? 0.45 : 1.2),
    z: PLAYER_Z,
    sx: 1.0,
    sy: sliding ? 0.78 : 2.25,
    sz: 0.9,
    sliding
  };
}

function checkBoxCollision(p, obj) {
  const size = obj.userData.size;
  const ox = obj.position.x;
  const oy = obj.position.y + size.y / 2;
  const oz = obj.position.z;
  return Math.abs(p.x - ox) < (p.sx + size.x) / 2 &&
         Math.abs(p.y - oy) < (p.sy + size.y) / 2 &&
         Math.abs(p.z - oz) < (p.sz + size.z) / 2;
}

function handleCollisions() {
  const p = playerBounds();

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obj = obstacles[i];
    if (obj.position.z > NEAR_Z) {
      scene.remove(obj);
      obstacles.splice(i, 1);
      continue;
    }

    if (obj.userData.hit) continue;
    if (Math.abs(obj.position.z - PLAYER_Z) > 2.8) continue;
    if (!checkBoxCollision(p, obj)) continue;

    const type = obj.userData.type;
    if (type === 'jumpPad') {
      verticalVelocity = 16.5;
      jumpCount = 1;
      slowEnergy = Math.min(100, slowEnergy + 8);
      obj.userData.hit = true;
      cameraShake = 0.1;
      continue;
    }

    if (type === 'highLaser' && p.sliding) {
      obj.userData.hit = true;
      slowEnergy = Math.min(100, slowEnergy + 4);
      continue;
    }

    if ((type === 'lowBarrier' || type === 'empMine') && player.position.y > 1.15) {
      obj.userData.hit = true;
      continue;
    }

    obj.userData.hit = true;
    takeDamage(type === 'bossLaser' ? 32 : 24);
  }

  for (let i = collectibles.length - 1; i >= 0; i--) {
    const obj = collectibles[i];
    if (obj.position.z > NEAR_Z) {
      scene.remove(obj);
      collectibles.splice(i, 1);
      continue;
    }
    if (obj.userData.collected) continue;
    if (Math.abs(player.position.x - obj.position.x) < 1.15 &&
        Math.abs(player.position.y + 1.1 - obj.position.y) < 1.5 &&
        Math.abs(PLAYER_Z - obj.position.z) < 1.5) {
      obj.userData.collected = true;
      shards++;
      slowEnergy = Math.min(100, slowEnergy + 4.5);
      coreEnergy = Math.min(100, coreEnergy + 0.8);
      scene.remove(obj);
      collectibles.splice(i, 1);
    }
  }
}

function updateWorld(dt, worldSpeed) {
  for (const seg of roadSegments) {
    seg.position.z += worldSpeed * dt;
    seg.children.forEach((child, idx) => {
      if (child.geometry?.type === 'TorusGeometry') child.rotation.z += dt * 0.85;
    });
    if (seg.position.z > NEAR_Z) seg.position.z -= roadSegments.length * 24;
  }

  for (const piece of cityPieces) {
    piece.position.z += worldSpeed * dt * 0.94;
    if (piece.position.z > 36) {
      piece.position.z = FAR_Z - randomRange(0, 70);
      piece.position.x = (Math.random() > 0.5 ? 1 : -1) * randomRange(9, 22);
    }
  }

  for (const board of billboards) {
    board.position.z += worldSpeed * dt * 0.96;
    board.position.y += Math.sin(performance.now() * 0.001 + board.position.z) * 0.002;
    if (board.position.z > 28) {
      board.position.z = FAR_Z - randomRange(0, 60);
      board.position.x = (Math.random() > 0.5 ? 1 : -1) * randomRange(8, 15);
      board.position.y = randomRange(5, 16);
    }
  }

  for (const item of obstacles) {
    item.position.z += worldSpeed * dt;
    item.rotation.y += dt * (item.userData.type === 'empMine' ? 1.8 : 0.25);
  }

  for (const shard of collectibles) {
    shard.position.z += worldSpeed * dt;
    shard.rotation.y += dt * 2.8;
    shard.rotation.x += dt * 1.2;
    shard.position.y += Math.sin(performance.now() * 0.004 + shard.position.z) * 0.006;
  }

  const rain = rainDrops[0];
  const pos = rain.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let y = pos.getY(i) - dt * 24;
    let z = pos.getZ(i) + worldSpeed * dt * 0.62;
    if (y < 0 || z > 22) {
      y = randomRange(18, 42);
      z = randomRange(FAR_Z, -10);
      pos.setX(i, randomRange(-36, 36));
    }
    pos.setY(i, y);
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;

  for (const item of dynamicObjects) {
    if (item.kind === 'speedLines') {
      const p = item.mesh.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        let z = p.getZ(i) + worldSpeed * dt * 1.8;
        if (z > 12) {
          z = randomRange(-100, -30);
          p.setX(i, randomRange(-8, 8));
          p.setY(i, randomRange(1.4, 8));
        }
        p.setZ(i, z);
      }
      p.needsUpdate = true;
    }
  }
}

function updatePlayer(dt) {
  currentLane = targetLane;
  const targetX = laneX[targetLane];
  player.position.x = THREE.MathUtils.lerp(player.position.x, targetX, 1 - Math.pow(0.001, dt));

  verticalVelocity -= 30 * dt;
  player.position.y += verticalVelocity * dt;
  if (player.position.y <= 0) {
    player.position.y = 0;
    verticalVelocity = 0;
    jumpCount = 0;
  }

  if (slideTimer > 0) {
    slideTimer -= dt;
    player.scale.y = THREE.MathUtils.lerp(player.scale.y, 0.55, 1 - Math.pow(0.0008, dt));
    player.scale.x = THREE.MathUtils.lerp(player.scale.x, 1.12, 1 - Math.pow(0.0008, dt));
  } else {
    player.scale.y = THREE.MathUtils.lerp(player.scale.y, 1, 1 - Math.pow(0.0008, dt));
    player.scale.x = THREE.MathUtils.lerp(player.scale.x, 1, 1 - Math.pow(0.0008, dt));
  }

  player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, (player.position.x - targetX) * -0.08, 0.12);
  player.rotation.y = Math.sin(performance.now() * 0.006) * 0.025;

  const core = player.children.find(c => c.name === 'Surya Core');
  if (core) core.rotation.z += dt * 3.4;
}

function updateDrone(dt) {
  const pressure = Math.min(1, distance / 4200);
  hunterDrone.position.x = THREE.MathUtils.lerp(hunterDrone.position.x, player.position.x * 0.64, dt * (1.4 + pressure * 2.2));
  hunterDrone.position.y = 5.2 + Math.sin(performance.now() * 0.004) * 0.35;
  hunterDrone.position.z = 8.2 - pressure * 2.2 + Math.sin(performance.now() * 0.002) * 0.45;
  hunterDrone.rotation.y += dt * 0.9;
  hunterDrone.rotation.z = Math.sin(performance.now() * 0.006) * 0.24;
}

function updateBoss(dt) {
  if (!bossActive && distance >= nextBossDistance) {
    bossActive = true;
    bossTimer = 15.5;
    nextBossDistance += 1000;
    guardian.visible = true;
    guardian.position.z = -96;
    warningEl.classList.remove('hidden');
    cameraShake = 0.55;
  }

  if (bossActive) {
    bossTimer -= dt;
    guardian.visible = true;
    guardian.position.x = Math.sin(performance.now() * 0.0016) * 7;
    guardian.position.y = 15 + Math.sin(performance.now() * 0.003) * 1.5;
    guardian.rotation.y = Math.sin(performance.now() * 0.0014) * 0.2;

    if (bossTimer <= 0) {
      bossActive = false;
      guardian.visible = false;
      warningEl.classList.add('hidden');
      slowEnergy = Math.min(100, slowEnergy + 22);
      coreEnergy = Math.min(100, coreEnergy + 6);
    }
  }
}

function updateSpawning(dt) {
  spawnTimer -= dt;
  shardTimer -= dt;
  empTimer -= dt;

  const baseSpawn = bossActive ? 0.42 : Math.max(0.42, 0.9 - distance / 9000);
  if (spawnTimer <= 0) {
    spawnObstaclePattern(bossActive && Math.random() > 0.25);
    spawnTimer = baseSpawn + randomRange(0, 0.22);
  }

  if (shardTimer <= 0) {
    spawnShardLine();
    shardTimer = randomRange(1.0, 1.7);
  }

  if (empTimer <= 0 && distance > 450) {
    const lane = Math.floor(Math.random() * 3);
    createObstacle('empMine', lane, FAR_Z - 12);
    empTimer = Math.max(1.5, 3.8 - distance / 3500);
  }
}

function updateUI() {
  const d = Math.floor(distance);
  distanceEl.textContent = d;
  shardsEl.textContent = shards;
  highScoreEl.textContent = highScore;
  speedLevelEl.textContent = Math.max(1, Math.floor(speed / 10) - 1);
  coreBar.style.width = `${coreEnergy}%`;
  slowBar.style.width = `${slowEnergy}%`;
}

function updateCamera(dt) {
  const targetCamX = player.position.x * 0.22;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, dt * 3.2);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, 6.8 + player.position.y * 0.12, dt * 2.5);

  if (cameraShake > 0) {
    camera.position.x += randomRange(-cameraShake, cameraShake);
    camera.position.y += randomRange(-cameraShake * 0.45, cameraShake * 0.45);
    cameraShake = Math.max(0, cameraShake - dt * 1.5);
  }

  camera.lookAt(player.position.x * 0.32, 1.9 + player.position.y * 0.1, -24);
}

function updateMaterials(dt) {
  const t = performance.now() * 0.002;
  for (const mat of pulseMaterials) {
    if ('emissiveIntensity' in mat) {
      const base = mat === materials.playerNeon ? 2.7 : mat === materials.danger ? 2.4 : 1.8;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, base + Math.sin(t) * 0.25, dt * 4);
    }
  }
  goldLight.intensity = 15 + Math.sin(t * 1.2) * 5;
  cyanLight.intensity = 11 + Math.cos(t * 1.5) * 4;
}

function animate() {
  requestAnimationFrame(animate);
  let dt = Math.min(clock.getDelta(), 0.045);

  if (running) {
    const slowFactor = slowTimer > 0 ? 0.44 : 1;
    if (slowTimer > 0) {
      slowTimer -= dt;
      slowBadge.classList.remove('hidden');
    } else {
      slowBadge.classList.add('hidden');
    }

    if (dashTimer > 0) dashTimer -= dt;
    if (invincibleTimer > 0) invincibleTimer -= dt;

    speed = 24 + distance * 0.0048 + (bossActive ? 3.5 : 0);
    const dashBoost = dashTimer > 0 ? 20 : 0;
    const worldSpeed = (speed + dashBoost) * slowFactor;

    distance += worldSpeed * dt;
    slowEnergy = Math.min(100, slowEnergy + dt * (bossActive ? 3.2 : 2.2));
    coreEnergy = Math.max(0, coreEnergy - dt * 0.62);
    if (coreEnergy <= 0) endGame();

    updatePlayer(dt);
    updateDrone(dt);
    updateBoss(dt);
    updateSpawning(dt);
    updateWorld(dt, worldSpeed);
    handleCollisions();
    updateCamera(dt);
    updateUI();
  } else {
    hunterDrone.rotation.y += dt * 0.55;
    guardian.rotation.y += dt * 0.16;
    updateWorld(dt, 8);
    updateCamera(dt);
  }

  updateMaterials(dt);
  composer.render();
}

startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'shift', 'e', 'a', 'd', 's', 'w'].includes(key)) {
    e.preventDefault();
  }
  if (!running && (key === 'enter' || key === ' ')) resetGame();
  if (key === 'arrowleft' || key === 'a') moveLane(-1);
  if (key === 'arrowright' || key === 'd') moveLane(1);
  if (key === 'arrowup' || key === 'w' || key === ' ') jump();
  if (key === 'arrowdown' || key === 's') slide();
  if (key === 'shift') dash();
  if (key === 'e') activateSlow();
});

jumpBtn.addEventListener('click', jump);
dashBtn.addEventListener('click', dash);
slideBtn.addEventListener('click', slide);
slowBtn.addEventListener('click', activateSlow);

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

window.addEventListener('touchstart', (e) => {
  if (!e.touches.length) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = performance.now();
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (!e.changedTouches.length) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const elapsed = performance.now() - touchStartTime;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (!running && elapsed < 300) return;
  if (elapsed > 650 && absX < 24 && absY < 24) {
    activateSlow();
    return;
  }
  if (absX < 38 && absY < 38 && elapsed < 260) {
    dash();
    return;
  }
  if (absX > absY) {
    if (dx > 36) moveLane(1);
    if (dx < -36) moveLane(-1);
  } else {
    if (dy < -36) jump();
    if (dy > 36) slide();
  }
}, { passive: true });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
});

// Pre-warm scene with a few objects so the start screen already looks alive.
spawnShardLine();
spawnObstaclePattern(false);
animate();
