import * as THREE from "three";

export default class WorldGenerator {

    constructor(scene) {
        this.scene = scene;
        this.roadWidth = 12;
        this.roadLength = 600;
    }

    create() {

        this.createRoad();

        this.createLaneLines();

        this.createBarriers();

    }

    createRoad() {

        const geometry = new THREE.PlaneGeometry(
            this.roadWidth,
            this.roadLength
        );

        const material = new THREE.MeshStandardMaterial({
            color: 0x222222
        });

        const road = new THREE.Mesh(
            geometry,
            material
        );

        road.rotation.x = -Math.PI / 2;

        road.position.z = this.roadLength / 2;

        road.receiveShadow = true;

        this.scene.add(road);

    }

    createLaneLines() {

        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff
        });

        const lanePositions = [-2, 2];

        lanePositions.forEach(x => {

            for (let i = 0; i < 60; i++) {

                const geometry = new THREE.BoxGeometry(
                    0.15,
                    0.02,
                    3
                );

                const dash = new THREE.Mesh(
                    geometry,
                    material
                );

                dash.position.set(
                    x,
                    0.02,
                    i * 10 + 5
                );

                this.scene.add(dash);

            }

        });

    }

    createBarriers() {

        const material = new THREE.MeshStandardMaterial({
            color: 0x00c3ff,
            emissive: 0x003344
        });

        [-6.5, 6.5].forEach(x => {

            const geometry = new THREE.BoxGeometry(
                0.3,
                1.2,
                this.roadLength
            );

            const barrier = new THREE.Mesh(
                geometry,
                material
            );

            barrier.position.set(
                x,
                0.6,
                this.roadLength / 2
            );

            this.scene.add(barrier);

        });

    }

}
