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
import { PhysicPlayer, PhysicsWeapon, PhysicsBullet, physicsPlayers } from "../../server/src/entities/PhysicsEntities";
import { string } from "@colyseus/schema/lib/encoding/decode";

const canvas = document.getElementById('game') as HTMLCanvasElement;

const engine = new BABYLON.Engine(canvas, true);

// This creates a basic Babylon Scene object (non-mesh)
var scene = new BABYLON.Scene(engine);

// This creates and positions a free camera (non-mesh)
// This creates and positions a free camera (non-mesh)
//#region Camera
var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

var cameraMoveToPos:BABYLON.Vector3;
var cameraMoveSpeed = 0.27;
//Units
var cameraZOffset = 2;
//Units
var cameraYHeight = 2;
//Degrees
var cameraXRotation = 55;
// This targets the camera to scene origin
camera.rotation.x = BABYLON.Tools.ToRadians(cameraXRotation);
camera.rotation.y = Math.PI;
camera.rotation.z = 0;
//#endregion

var playerId:string;
var playerSpeed = .27;
// This attaches the camera to the canvas
camera.attachControl(canvas, true);

camera.inputs.clear();
// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(1, -1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 3;

//Shadow

var shadowGenerator = new BABYLON.ShadowGenerator(1024,light);
shadowGenerator.usePoissonSampling = true;

BABYLON.SceneLoader.ImportMesh("","","TheArena01.babylon", scene, function(newmeshes){
    newmeshes.forEach(function (mesh){
        
    
        mesh.receiveShadows = true;
        mesh.rotation = new BABYLON.Vector3(0,BABYLON.Tools.ToRadians (90),0);
        mesh.receiveShadows = true;
        shadowGenerator.getShadowMap().renderList.push(mesh);
    
        
    });
    })
    


    
 

// Attach default camera mouse navigation
// camera.attachControl(canvas);

// Colyseus / Join Room
client.joinOrCreate<StateHandler>("game").then(room => {
    const playerViews: {[id: string]: PhysicPlayer} = {};



    console.log("Room started on client: "+room.name);
    room.state.players.onAdd = function(player, key) {


        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        console.log("User joined room: "+player.name+" mesh position: "+player.position);
        playerViews[key] = new PhysicPlayer(key,BABYLON.Mesh.CreateSphere("sphere1", 16, .2, scene),new Vector3(player.position.x,player.position.y,player.position.z),100);
        shadowGenerator.getShadowMap().renderList.push(playerViews[key].mesh);
      
    
        // Move the sphere upward 1/2 its height
        //playerViews[key].mesh.position = new Vector3(player.position.x,player.position.y,player.position.z);

        scene.registerBeforeRender(function () {
            
            if(key === room.sessionId){
                playerId = room.sessionId;
                cameraMoveToPos = new BABYLON.Vector3(player.position.x,cameraYHeight,player.position.z+cameraZOffset);
                camera.position = BABYLON.Vector3.Lerp(camera.position,cameraMoveToPos,cameraMoveSpeed);
            }
            playerViews[key].mesh.position = BABYLON.Vector3.Lerp(playerViews[key].mesh.position,playerViews[key].clickPosition,playerSpeed);
            
        });

      
        
        // Set camera to follow current player
    
        
    };

    
    room.state.players.onChange = function(player, key) {

        //console.log("Server moved player move locally");
        const physicP : PhysicPlayer = playerViews[key];
        physicP.clickPosition = PositionToVector(player.position);
        physicP.health = player.health;

        
        
        for(var weaponId in player.weapons){

            if(weaponId in physicP.weapons){
                //console.log("Updating bullet position from "+physicP.weapons[weaponId].position +" to "+ PositionToVector(player.weapons[weaponId].pos));
                physicP.weapons[weaponId].mesh.position = PositionToVector(player.weapons[weaponId].pos);
            }
            else{
                console.log("New Bullet added to client");
                physicP.weapons.push(new PhysicsBullet("Bullet",PositionToVector(player.weapons[weaponId].pos),10,key,BABYLON.Mesh.CreateSphere("sphere1", 16,.05, scene),null,true));
            }
           
        }
        
        //playerViews[key].camera.position = PositionToVector(player.position);
        //playerViews[key].camera.position.y -=15;
        if(room.sessionId === key){
            console.log("This Players Health: "+physicP.health);
            cameraMoveToPos = new BABYLON.Vector3(player.position.x,cameraYHeight,player.position.z+cameraZOffset);

            //camera.setTarget(playerViews[key].mesh.position);
            //console.log("Camear position: x"+camera.rotation.x+" y:"+camera.rotation.y+" z:"+camera.rotation.z);
       
        }
    };

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key].mesh);
        
        delete playerViews[key];
    };

   

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
                  const pos: MouseClick  = {x:pickResult.pickedPoint.x,y:pickResult.pickedPoint.y,z:pickResult.pickedPoint.z}

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
                const pos: MouseClick  = {x:pickResult.pickedPoint.x,y:pickResult.pickedPoint.y,z:pickResult.pickedPoint.z}
                //var clientMovePrediction = playerViews[playerId].Move(MouseToVector(pos));
                //if(clientMovePrediction != null){
                //    playerViews[playerId].mesh.translate(clientMovePrediction,0.015,BABYLON.Space.WORLD);
                //    playerViews[playerId].clickPosition = playerViews[playerId].mesh.position;
                //}
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

function MouseToVector(mouse: MouseClick){
    return new Vector3(mouse.x,mouse.y,mouse.z);
}

// Scene render loop
engine.runRenderLoop(function() {
    scene.render();
});
