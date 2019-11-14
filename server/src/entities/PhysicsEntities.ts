
import {ServerPlayer} from "../entities/ServerEntities";
import * as BABYLON from "babylonjs";
export let physicsPlayers: {[id:string]:PhysicPlayer} = {};

class MoveableObject{
    uuid: string;
    position: BABYLON.Vector3;
    constructor(id: string,postion: BABYLON.Vector3){
        this.uuid = id;
        this.position = postion;
    }

}

export class PhysicPlayer extends MoveableObject{

    mesh: BABYLON.Mesh;
    clickPosition: BABYLON.Vector3;

    constructor(id:string,mesh: BABYLON.Mesh,position:BABYLON.Vector3){
        super(id,position);
        this.mesh = mesh;
        this.clickPosition = position;
        this.mesh.position = position;

    }
   //Called once per frame
    Update(){
        //Move the player if needed.
        this.Move();



        this.position = this.mesh.position;
    }

    //Moves the player towards the click position if not already there
    Move(){
        var newVector = this.clickPosition.subtract(this.mesh.position);
        if(newVector.length() < 1)
            return;
        this.mesh.translate(newVector.normalize(),.09,BABYLON.Space.WORLD);

        
    }

  
}