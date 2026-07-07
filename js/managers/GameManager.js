import * as THREE from "three";
import WorldGenerator from "../world/WorldGenerator.js";

export default class GameManager {

    constructor() {

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

    }

    async initialize() {

        this.createScene();

        this.createCamera();

        this.createRenderer();

        this.createLights();

        const world = new WorldGenerator(this.scene);
        world.create();

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
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.camera.position.set(
            0,
            7,
            -12
        );

        this.camera.lookAt(
            0,
            2,
            15
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

        const ambient = new THREE.AmbientLight(
            0xffffff,
            2
        );

        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(
            0xffffff,
            2
        );

        sun.position.set(
            10,
            25,
            -10
        );

        sun.castShadow = true;

        this.scene.add(sun);

    }

    update() {

        const delta = this.clock.getDelta();

        // Future game updates will go here.

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
