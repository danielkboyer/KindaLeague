
import {ServerPlayer} from "../entities/ServerEntities";
import * as BABYLON from "babylonjs";
import { int, Vector3 } from "babylonjs";

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


export class PhysicsWeapon extends MoveableObject
{
    damage: number;
    mesh: BABYLON.Mesh;
    //The player it belongs to.
    playerId:string;
    //True if the weapon has been fired.
    fired: boolean; 
    constructor(id:string,position:BABYLON.Vector3,damage:number,playerId:string){
        super(id,position);
        this.playerId = playerId;
        this.damage = damage;
        //this.mesh.position = position;
    }

    //Returns false if the weapon should be disposed... AKA bullet hit player remove it.
    Update():boolean{
        if(this.fired){
            var collidedWith = this.CheckCollision();
            //var collidedWith = null;
            if(collidedWith != null){
                //applydamage to player
                collidedWith.health -= this.OnHit();
                return false;
            }
        }
        return true;

    }
    //The default OnHit method of a weapon.
    OnHit():number{
        return this.damage;
    }

    CheckCollision(){
        for(const sessionId in physicsPlayers){
            if(sessionId != this.playerId){
                const physPlayer:PhysicPlayer = physicsPlayers[sessionId];
                if(this.mesh.intersectsMesh(physPlayer.mesh)){
                    return physPlayer;
                }
            }
        }
    }

    

}

export class PhysicsBullet extends PhysicsWeapon
{

    shotDistance: BABYLON.Vector3;

    constructor(id:string,position:BABYLON.Vector3,damage:number,playerId: string,mesh:BABYLON.Mesh,shotDistance:BABYLON.Vector3,fired:boolean){
        super(id,position,damage,playerId);
        this.mesh = mesh;
        this.mesh.position = position;
        this.shotDistance = shotDistance;
        this.fired = fired;
    }
    
    //Move the bullet if it's fired, returns false if done moving.
    Move():boolean
    {
        
        var newVector = this.shotDistance.subtract(this.mesh.position);
        if(newVector.length() < .2)
            return false;

        
        this.mesh.translate(newVector.normalize(),.07,BABYLON.Space.WORLD);
        this.position = this.mesh.position;
        return true;
    }

    Update():boolean{

        if(this.fired){
            if(!this.Move()){
                return false;
            }
        }

        
        return super.Update();
    }
}


export class PhysicPlayer extends MoveableObject{

    health:number;
    mesh: BABYLON.Mesh;
    clickPosition: BABYLON.Vector3;
    weapons: PhysicsWeapon[] = [];

    constructor(id:string,mesh: BABYLON.Mesh,position:BABYLON.Vector3,health:number){
        super(id,position);
        this.mesh = mesh;
        this.clickPosition = position;
        this.mesh.position = position;
        this.health = health;

    }
   //Called once per frame
    Update(){
        //Move the player if needed.
        var moveTo = this.Move(this.clickPosition);
        if(moveTo!=null)
            this.mesh.translate(moveTo,0.015,BABYLON.Space.WORLD);

        for(var weaponId in this.weapons){
            
            if(!this.weapons[weaponId].Update()){
                //Remove the weapon here.
          
                delete this.weapons[weaponId];
            }
        }
        //Set the position of the movable object
        super.Update(this.mesh.position);
    }

    //Moves the player towards the click position if not already there
    Move(goTo:BABYLON.Vector3):BABYLON.Vector3{
        var newVector = goTo.subtract(this.mesh.position);
        if(newVector.length() < .05)
            return null;
        return newVector.normalize();
        
        
    }

  
}