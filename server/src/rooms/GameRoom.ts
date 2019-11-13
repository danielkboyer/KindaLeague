import { Room, Client } from "colyseus";

import { StateHandler } from "./StateHandler";
import { Player, Position } from "../entities/Player";
import * as BABYLON from "babylonjs";
import { Vector3 } from "babylonjs";

export class GameRoom extends Room<StateHandler> {
    maxClients = 8;

    
    onCreate (options) {
        this.setSimulationInterval(() => this.onUpdate());
        this.setState(new StateHandler(new BABYLON.NullEngine()));
        console.log("Creating state: "+this.state.scene+" engine: "+this.state.engine);
    }

    onJoin (client) {
        const player = new Player();
        player.name = `Player ${ client.sessionId }`;

        player.setMesh(BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.state.scene));
        player.setPosition(new Position(Math.random(),Math.random(),Math.random()));
        console.log("Created player "+client.sessionId+" position: "+player.position);
        this.state.players[client.sessionId] = player;
    }

    onMessage (client: Client, message: any) {
        const [event, data] = message;
        const player: Player = this.state.players[client.sessionId];

        if (event === "key") {
            player.pressedKeys = data;
        }
    }

    onUpdate () {
        for (const sessionId in this.state.players) {
            const player: Player = this.state.players[sessionId];
            player.setPositionX(player.position.x+ (player.pressedKeys.x*.1));
            player.setPositionZ(player.position.z - (player.pressedKeys.y*0.1));
    
        }
    }

    onLeave (client: Client) {
        delete this.state.players[client.sessionId];
    }

    onDispose () {
    }

}
