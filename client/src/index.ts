import "./index.css";

import * as BABYLON from "babylonjs";
import Keycode from "keycode.js";

import { client } from "./game/network";

// Re-using server-side types for networking
// This is optional, but highly recommended
import { StateHandler } from "../../server/src/rooms/StateHandler";
import { PressedKeys, Position } from "../../server/src/entities/Player";
import { ClientPlayer } from "./game/model/ClientPlayer";
import { Vector3, CameraInputTypes } from "babylonjs";

const canvas = document.getElementById('game') as HTMLCanvasElement;

const engine = new BABYLON.Engine(canvas, true);

// This creates a basic Babylon Scene object (non-mesh)
var scene = new BABYLON.Scene(engine);

// This creates and positions a free camera (non-mesh)
// This creates and positions a free camera (non-mesh)
var camera = new BABYLON.FollowCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

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
    const playerViews: {[id: string]: ClientPlayer} = {};

    console.log("Room started on client: "+room.name);
    room.state.players.onAdd = function(player, key) {
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        console.log("User joined room: "+player.name+" mesh position: "+player.position);
        playerViews[key] = {mesh: BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)};
      
        // playerViews[key].camera.radius = 30;

        // playerViews[key].camera.heightOffset = 10;

        // playerViews[key].camera.rotationOffset = 0;

        // playerViews[key].camera.cameraAcceleration = 0.005;

        // playerViews[key].camera.maxCameraSpeed = 10;

        
       
        // Move the sphere upward 1/2 its height
        playerViews[key].mesh.position = new Vector3(player.position.x,player.position.y,player.position.z);

    

        if(key === room.sessionId){

            console.log("Setting active camera for "+room.sessionId);
            camera.setTarget(playerViews[key].mesh.position);
           // scene.activeCamera = playerViews[key].camera;
            
        }
        // Set camera to follow current player
    
        
    };

    room.state.players.onChange = function(player, key) {

        
        playerViews[key].mesh.position = PositionToVector(player.position);
        //playerViews[key].camera.position = PositionToVector(player.position);
        //playerViews[key].camera.position.y -=15;
        if(room.sessionId === key){
            camera.setTarget(playerViews[key].mesh.position);
        }
    };

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key].mesh);
        
        delete playerViews[key];
    };

    room.onStateChange((state) => {
        console.log("New room state:", state.toJSON());
    });

    // Keyboard listeners
    const keyboard: PressedKeys = { x: 0, y: 0 };
    window.addEventListener("keydown", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = -1;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 1;
        } else if (e.which === Keycode.UP) {
            keyboard.y = -1;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = 1;
        }
        room.send(['key', keyboard]);
    });

    window.addEventListener("keyup", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.UP) {
            keyboard.y = 0;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = 0;
        }
        room.send(['key', keyboard]);
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
