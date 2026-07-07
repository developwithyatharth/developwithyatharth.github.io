import * as THREE from "three";

export default class GameManager{

    constructor(){

        this.scene=null;

        this.camera=null;

        this.renderer=null;

        this.clock=new THREE.Clock();

    }

    async initialize(){

        this.createScene();

        this.createCamera();

        this.createRenderer();

        this.createLights();

        this.createGround();

        window.addEventListener(

            "resize",

            ()=>this.onResize()

        );

    }

    createScene(){

        this.scene=new THREE.Scene();

        this.scene.background=

        new THREE.Color(0x6bbcff);

    }

    createCamera(){

        this.camera=

        new THREE.PerspectiveCamera(

            60,

            window.innerWidth/window.innerHeight,

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

    createRenderer(){

        this.renderer=

        new THREE.WebGLRenderer({

            canvas:document.getElementById("gameCanvas"),

            antialias:true

        });

        this.renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );

        this.renderer.setPixelRatio(

            Math.min(window.devicePixelRatio,2)

        );

    }

    createLights(){

        const ambient=

        new THREE.AmbientLight(

            0xffffff,

            2

        );

        this.scene.add(ambient);

        const sun=

        new THREE.DirectionalLight(

            0xffffff,

            2

        );

        sun.position.set(

            10,

            25,

            -10

        );

        this.scene.add(sun);

    }

    createGround(){

        const geometry=

        new THREE.PlaneGeometry(

            30,

            500

        );

        const material=

        new THREE.MeshStandardMaterial({

            color:0x202020

        });

        const ground=

        new THREE.Mesh(

            geometry,

            material

        );

        ground.rotation.x=-Math.PI/2;

        ground.position.z=200;

        this.scene.add(ground);

    }

    update(){

        const delta=

        this.clock.getDelta();

    }

    render(){

        this.renderer.render(

            this.scene,

            this.camera

        );

    }

    start(){

        const animate=()=>{

            requestAnimationFrame(animate);

            this.update();

            this.render();

        };

        animate();

    }

    onResize(){

        this.camera.aspect=

        window.innerWidth/

        window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );

    }

}
