import "./index.css";

import * as BABYLON from "babylonjs";
import Keycode from "keycode.js";

import { client } from "./game/network";

// Re-using server-side types for networking
// This is optional, but highly recommended
import { StateHandler } from "../../server/src/rooms/StateHandler";
import {  Position, MouseClick } from "../../server/src/entities/ServerEntities";
import { ClientPlayer } from "./game/model/ClientPlayer";
import { Vector3, CameraInputTypes } from "babylonjs";
import { PhysicPlayer, PhysicsWeapon, PhysicsBullet } from "../../server/src/entities/PhysicsEntities";

const canvas = document.getElementById('game') as HTMLCanvasElement;

const engine = new BABYLON.Engine(canvas, true);

// This creates a basic Babylon Scene object (non-mesh)
var scene = new BABYLON.Scene(engine);

// This creates and positions a free camera (non-mesh)
// This creates and positions a free camera (non-mesh)
var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

//Units
var cameraZOffset = 3;
//Units
var cameraYHeight = 15;
//Degrees
var cameraXRotation = 76;
// This targets the camera to scene origin
camera.rotation.x = BABYLON.Tools.ToRadians(cameraXRotation);
camera.rotation.y = Math.PI;
camera.rotation.z = 0;

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

camera.inputs.clear();
// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = .5;

// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

console.log("Created Ground");
// Attach default camera mouse navigation
// camera.attachControl(canvas);

// Colyseus / Join Room
client.joinOrCreate<StateHandler>("game").then(room => {
    const playerViews: {[id: string]: PhysicPlayer} = {};

    console.log("Room started on client: "+room.name);
    room.state.players.onAdd = function(player, key) {

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        console.log("User joined room: "+player.name+" mesh position: "+player.position);
        playerViews[key] = new PhysicPlayer(key,BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene),new Vector3(player.position.x,player.position.y,player.position.z),100);
        
      
    
        // Move the sphere upward 1/2 its height
        //playerViews[key].mesh.position = new Vector3(player.position.x,player.position.y,player.position.z);

    

        if(key === room.sessionId){

            console.log("Setting active camera for "+room.sessionId);
            camera.position = new BABYLON.Vector3(player.position.x,cameraYHeight,player.position.z+cameraZOffset);
            //camera.rotation.z = 10;
            //camera.setTarget(playerViews[key].mesh.position);
           // scene.activeCamera = playerViews[key].camera;
            
        }
        // Set camera to follow current player
    
        
    };

    
    room.state.players.onChange = function(player, key) {

        //console.log("Server moved player move locally");
        const physicP : PhysicPlayer = playerViews[key];
        physicP.mesh.position = PositionToVector(player.position);
        physicP.health = player.health;

        
        
        for(var weaponId in player.weapons){

            if(weaponId in physicP.weapons){
                //console.log("Updating bullet position from "+physicP.weapons[weaponId].position +" to "+ PositionToVector(player.weapons[weaponId].pos));
                physicP.weapons[weaponId].mesh.position = PositionToVector(player.weapons[weaponId].pos);
            }
            else{
                console.log("New Bullet added to client");
                physicP.weapons.push(new PhysicsBullet("Bullet",PositionToVector(player.weapons[weaponId].pos),10,BABYLON.Mesh.CreateSphere("sphere1", 16,.2, scene),null,true));
            }
           
        }
        
        //playerViews[key].camera.position = PositionToVector(player.position);
        //playerViews[key].camera.position.y -=15;
        if(room.sessionId === key){
            console.log("This Players Health: "+physicP.health);
            camera.position = new BABYLON.Vector3(player.position.x,cameraYHeight,player.position.z+cameraZOffset);
            //camera.setTarget(playerViews[key].mesh.position);
            //console.log("Camear position: x"+camera.rotation.x+" y:"+camera.rotation.y+" z:"+camera.rotation.z);
       
        }
    };

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key].mesh);
        
        delete playerViews[key];
    };

    room.onStateChange((state) => {
        console.log("New room state:", state.toJSON());
    });

    window.addEventListener("click",function(e:MouseEvent){

        //Basic attack is a Q
        console.log("Clicked "+e.which);
        if(e.which == 1){

            var pickResult = scene.pick(e.clientX,e.clientY,function(meshy){
                if(meshy !== null)
                  return true;
              return false;
            },false,camera);
  
            if(pickResult.hit){
                  console.log("Collided with Object");
                  //Click Position: clientX is the entire window not the document.
                  const pos: MouseClick  = {x:pickResult.pickedPoint.x,y:0,z:pickResult.pickedPoint.z}

                  //We need to move the player
                  room.send(['basicAttack', pos]);
            }
        }
    });
    window.addEventListener("contextmenu",function(e:MouseEvent){
    //Context menus is right lcick
    console.log("Mouse event of "+e.which);
    
      if(e.which == 3){
          var pickResult = scene.pick(e.clientX,e.clientY,function(meshy){
              if(meshy !== null)
                return true;
            return false;
          },false,camera);

          if(pickResult.hit){
                console.log("Collided with Object");
                //Click Position: clientX is the entire window not the document.
                const pos: MouseClick  = {x:pickResult.pickedPoint.x,y:0,z:pickResult.pickedPoint.z}
                //We need to move the player
                room.send(['playerMove', pos]);
          }
         
          
      }
    });
    

    // Resize the engine on window resize
    window.addEventListener('resize', function() {
        engine.resize();
    });
});

function PositionToVector(pos: Position){
    return new Vector3(pos.x,pos.y,pos.z);
}

// Scene render loop
engine.runRenderLoop(function() {
    scene.render();
});
