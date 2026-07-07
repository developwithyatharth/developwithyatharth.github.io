import * as THREE from "three";

export default class Player {

    constructor(scene) {

        this.scene = scene;
        this.mesh = null;

    }

    create() {

        // Capsule body
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

        // Position in the center lane
        this.mesh.position.set(
            0,
            1,
            4
        );

        this.scene.add(this.mesh);

    }

}
