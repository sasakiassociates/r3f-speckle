import { action, makeObservable, observable } from "mobx";
import type { NodeDataWrapper } from "../speckle";

class ProgramChunkStore {
    @observable
    mesh: NodeDataWrapper;

    @observable
    outline: NodeDataWrapper;

    constructor(mesh: NodeDataWrapper, outline: NodeDataWrapper) {
        makeObservable(this);
        this.mesh = mesh;
        this.outline = outline;
    }
}

export class SceneStore {
    @observable
    programChunks: ProgramChunkStore[] = [];

    constructor() {
        makeObservable(this);
    }

    @action
    addProgramChunk(mesh: NodeDataWrapper, outline: NodeDataWrapper) {
        this.programChunks.push(new ProgramChunkStore(mesh, outline));
    }

    addParcel(itemElement: NodeDataWrapper) {

    }
}

export const sceneStore = new SceneStore();
