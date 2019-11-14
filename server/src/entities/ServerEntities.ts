import { Schema, type } from "@colyseus/schema";
import {PhysicPlayer} from "../entities/PhysicsEntities";

import * as BABYLON from "babylonjs";
export interface MouseClick{
    x:number;
    y:number;
    z:number;
} 
export class Position extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}


export class ServerPlayer extends Schema {
    
    @type("string") name: string;

  
 
    @type(Position)
    position = new Position();
   
  
    constructor () {
        super();
        
    }

    PopulateServerPlayer(physPlayer:PhysicPlayer){
        physPlayer.Update();
        this.SetPosition(physPlayer.position);
    }
    SetPosition(vector: BABYLON.Vector3){
        this.position.x = vector.x;
        this.position.y = vector.y;
        this.position.z = vector.z;
    }
  
}
