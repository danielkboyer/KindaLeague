import { Room, Client } from "colyseus";

import { StateHandler } from "./StateHandler";
import { ServerPlayer, Position } from "../entities/ServerEntities";
import * as BABYLON from "babylonjs";

import {physicsPlayers, PhysicPlayer} from "../entities/PhysicsEntities";

export class GameRoom extends Room<StateHandler> {
    maxClients = 8;

    
    onCreate (options) {
        this.setSimulationInterval(() => this.onUpdate());
        this.setState(new StateHandler(new BABYLON.NullEngine()));
        console.log("Creating state: "+this.state.scene+" engine: "+this.state.engine);
    }

    onJoin (client) {
        const player = new ServerPlayer();
        player.name = `Player ${ client.sessionId }`;

        console.log(player.name + " Joined the server");
        player.position.x = Math.random();
        player.position.y = Math.random();
        player.position.z = Math.random();
        physicsPlayers[client.sessionId] = new PhysicPlayer(client.sessionId,BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.state.scene),new BABYLON.Vector3(player.position.x,player.position.y,player.position.z));

        this.state.players[client.sessionId] = player;
    }

    onMessage (client: Client, message: any) {
        const [event, data] = message;
        const player: PhysicPlayer = physicsPlayers[client.sessionId];

        if (event === "playerMove") {
            player.clickPosition = new BABYLON.Vector3(data.x,data.y,data.z);
        }
    }

    onUpdate () {
        for (const sessionId in this.state.players) {
            const player: ServerPlayer = this.state.players[sessionId];
            player.PopulateServerPlayer(physicsPlayers[sessionId]);
    
        }
    }

    onLeave (client: Client) {
        delete this.state.players[client.sessionId];
    }

    onDispose () {
    }

}
