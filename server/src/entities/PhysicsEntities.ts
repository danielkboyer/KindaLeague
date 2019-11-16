
import {ServerPlayer} from "../entities/ServerEntities";
import * as BABYLON from "babylonjs";
import { int } from "babylonjs";
export let physicsPlayers: {[id:string]:PhysicPlayer} = {};

class MoveableObject{
    uuid: string;
    position: BABYLON.Vector3;
    constructor(id: string,postion: BABYLON.Vector3){
        this.uuid = id;
        this.position = postion;
    }

    //Will be overrided
    Update(pos: BABYLON.Vector3){
        this.position = pos;
    }

}


class Weapon extends MoveableObject
{
    damage: number;
    mesh: BABYLON.Mesh;
    constructor(id:string,position:BABYLON.Vector3,damage:number){
        super(id,position);
        this.damage = damage;
    }

    //Returns false if the weapon should be disposed... AKA bullet hit player remove it.
    Update():boolean{
        var collidedWith = this.CheckCollision();
        if(collidedWith != null){
            //applydamage to player
        }
        return true;

    }
    //The default OnHit method of a weapon.
    OnHit():number{
        return this.damage;
    }

    CheckCollision(){
        for(const sessionId in physicsPlayers){
            const physPlayer:PhysicPlayer = physicsPlayers[sessionId];
            if(this.mesh.intersectsMesh(physPlayer.mesh)){
                return physPlayer;
            }
        }
    }

    

}

export class Bullet extends Weapon
{

    mesh:BABYLON.Mesh;

    constructor(id:string,position:BABYLON.Vector3,damage:number,mesh:BABYLON.Mesh){
        super(id,position,damage);
        this.mesh = mesh;
    }
}


export class PhysicPlayer extends MoveableObject{

    mesh: BABYLON.Mesh;
    clickPosition: BABYLON.Vector3;
    weapons: Weapon[] = [];

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

        //Set the position of the movable object
        super.Update(this.mesh.position);
    }

    //Moves the player towards the click position if not already there
    Move(){
        var newVector = this.clickPosition.subtract(this.mesh.position);
        if(newVector.length() < 1)
            return;
        this.mesh.translate(newVector.normalize(),.09,BABYLON.Space.WORLD);

        
    }

  
}