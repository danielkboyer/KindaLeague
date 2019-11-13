import { Schema, type } from "@colyseus/schema";

import  * as BABYLON from "babylonjs";
import { Vector3 } from "babylonjs";

export interface PressedKeys {
    x: number;
    y: number;
}

export class Position extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class Player extends Schema {
    
    @type("string") name: string;

    private mesh: BABYLON.Mesh;

    @type(Position)
    position = new Position();
   
    
    pressedKeys: PressedKeys = { x: 0, y: 0 };

    constructor () {
        super();
    }

    setPositionX(x: number){
        this.position.x = x;
        this.mesh.position.x = x;
    }
    setPositionY(y: number){
        this.position.y = y;
        this.mesh.position.y = y;
    }
    setPositionZ(z: number){
        this.position.z = z;
        this.mesh.position.z= z;
    }
    //Sets the position of the player and it's mesh
    setPosition(pos: Position){
        this.position = pos;
        this.mesh.position = new Vector3(pos.x,pos.y,pos.z);
    }
    setMesh(mesh: BABYLON.Mesh){
        this.mesh = mesh;
    }
}
