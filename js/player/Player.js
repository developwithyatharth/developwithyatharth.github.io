import * as THREE from "three";

export default class Player {

    constructor(scene) {

        this.scene = scene;

        this.mesh = null;

        this.speed = 8;

    }

    create() {

        const geometry = new THREE.CapsuleGeometry(
            0.4,
            1.2,
            8,
            16
        );

        const material = new THREE.MeshStandardMaterial({

            color: 0xff7a00,
            metalness: 0.3,
            roughness: 0.4

        });

        this.mesh = new THREE.Mesh(
            geometry,
            material
        );

        this.mesh.castShadow = true;

        this.mesh.position.set(
            0,
            1,
            4
        );

        this.scene.add(this.mesh);

    }

    update(deltaTime) {

        this.mesh.position.z += this.speed * deltaTime;

    }

}
