export default class Engine{

    constructor(canvas){

        this.canvas=canvas;

        this.engine=new BABYLON.Engine(

            canvas,

            true,

            {

                preserveDrawingBuffer:true,

                stencil:true,

                disableWebGL2Support:false

            }

        );

    }

    getEngine(){

        return this.engine;

    }

}
