import { Schema, type, MapSchema } from "@colyseus/schema";
import {PhysicPlayer, PhysicsWeapon} from "../entities/PhysicsEntities";

import * as BABYLON from "babylonjs";
import { float } from "babylonjs";
export interface MouseClick{
    x:number;
    y:number;
    z:number;
} 
export class Position extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
    constructor(x:number,y:number,z:number){
        super();
        this.x = x;
        this.y = y;
        this.z = z;

    }
}


export class ServerWeapon extends Schema{
    @type(Position) pos = new Position(0,0,0);
    constructor(position:Position){
        super();
        this.pos = position;
    }

}

export class ServerPlayer extends Schema {
    
    @type("string") name: string;

    @type("float64") health: float;
 
    @type({map:ServerWeapon}) weapons = new MapSchema<ServerWeapon>();

    @type(Position)
    position = new Position(0,0,0);
   
  
    constructor () {
        super();
        
    }

    PopulateServerPlayer(physPlayer:PhysicPlayer){
        physPlayer.Update();

        this.health = physPlayer.health;
        this.SetPosition(physPlayer.position);

        for(var weaponId in physPlayer.weapons){

            const weapon: PhysicsWeapon = physPlayer.weapons[weaponId];
            if(weaponId in this.weapons){
                this.weapons[weaponId].pos.x = weapon.position.x;
                this.weapons[weaponId].pos.y = weapon.position.y;
                this.weapons[weaponId].pos.z = weapon.position.z;

            }
            else{
                this.weapons[weaponId] = new ServerWeapon(new Position(weapon.position.x,weapon.position.y,weapon.position.z));
            }
            
        }
    }
    SetPosition(vector: BABYLON.Vector3){
        this.position.x = vector.x;
        this.position.y = vector.y;
        this.position.z = vector.z;
    }
  
}
