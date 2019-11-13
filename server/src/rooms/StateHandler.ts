import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "../entities/Player";
import * as BABYLON from "babylonjs";
export class StateHandler extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    engine :BABYLON.NullEngine;
    scene :BABYLON.Scene;
   
    constructor(eng: BABYLON.NullEngine){
        super();
        this.engine = eng;
        this.scene = new BABYLON.Scene(this.engine);
    }
}
