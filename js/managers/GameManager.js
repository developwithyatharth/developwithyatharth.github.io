import * as THREE from "three";
import WorldGenerator from "../world/WorldGenerator.js";
import Player from "../player/Player.js";

export default class GameManager {

    constructor() {

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        this.world = null;
        this.player = null;

    }

    async initialize() {

        this.createScene();

        this.createCamera();

        this.createRenderer();

        this.createLights();

        this.createWorld();

        this.createPlayer();

        window.addEventListener(
            "resize",
            () => this.onResize()
        );

    }

    createScene() {

        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0x6bbcff);

    }

    createCamera() {

        this.camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.camera.position.set(
            0,
            5,
            -8
        );

        this.camera.lookAt(
            0,
            1,
            8
        );

    }

    createRenderer() {

        this.renderer = new THREE.WebGLRenderer({

            canvas: document.getElementById("gameCanvas"),

            antialias: true

        });

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.shadowMap.enabled = true;

    }

    createLights() {

        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            2
        );

        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(
            0xffffff,
            2
        );

        sunLight.position.set(
            10,
            25,
            -10
        );

        sunLight.castShadow = true;

        this.scene.add(sunLight);

    }

    createWorld() {

        this.world = new WorldGenerator(this.scene);

        this.world.create();

    }

    createPlayer() {

        this.player = new Player(this.scene);

        this.player.create();

    }

    update() {

        const deltaTime = this.clock.getDelta();

        // Future updates will be added here.
        // Example:
        // this.player.update(deltaTime);

    }

    render() {

        this.renderer.render(
            this.scene,
            this.camera
        );

    }

    start() {

        const animate = () => {

            requestAnimationFrame(animate);

            this.update();

            this.render();

        };

        animate();

    }

    onResize() {

        this.camera.aspect =
            window.innerWidth / window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

}
