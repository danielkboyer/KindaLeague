import { Schema, type, MapSchema } from "@colyseus/schema";
import { ServerPlayer } from "../entities/ServerEntities";
import * as BABYLON from "babylonjs";
export class StateHandler extends Schema {
    
    @type({ map: ServerPlayer }) players = new MapSchema<ServerPlayer>();
    engine :BABYLON.NullEngine;
    scene :BABYLON.Scene;
   
    constructor(eng: BABYLON.NullEngine){
        super();
        this.engine = eng;
        this.scene = new BABYLON.Scene(this.engine);
    }
}
