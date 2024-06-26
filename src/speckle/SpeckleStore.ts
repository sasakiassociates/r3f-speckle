import { action, computed, makeObservable, observable } from "mobx";
import type { NodeDataWrapper } from "./NodeDataWrapper";
import type { VisualizerStore } from "../store";

export class SpeckleStore {
    @observable
    meshes: NodeDataWrapper[] = [];

    @observable
    lines: NodeDataWrapper[] = [];

    @observable
    baseImages: NodeDataWrapper[] = [];

    @observable
    visualizerStore?: VisualizerStore;

    constructor() {
        makeObservable(this);
    }

    @action
    addMesh(wrapper: NodeDataWrapper) {
        this.meshes.push(wrapper);
    }

    @action
    addLine(wrapper: NodeDataWrapper) {
        this.lines.push(wrapper);
    }

    @action
    addBaseImage(wrapper: NodeDataWrapper) {
        this.baseImages.push(wrapper);
    }

    @computed
    get loadedLines() {
        return this.lines.filter(n => n.conversionComplete);
    }

    @computed
    get loadedMeshes() {
        return this.meshes.filter(n => n.conversionComplete);
    }

    @computed
    get loadedBaseImages() {
        return this.baseImages.filter(n => n.conversionComplete);
    }

    @computed
    get includedLines() {
        const visualizerStore = this.visualizerStore;
        if (!visualizerStore) return this.loadedLines;
        return this.loadedLines.filter(n => visualizerStore.includeNode(n));
    }

    @computed
    get includedMeshes() {
        const visualizerStore = this.visualizerStore;
        if (!visualizerStore) return this.loadedMeshes;
        return this.loadedMeshes.filter(n => visualizerStore.includeNode(n));
    }

    @computed
    get includedBaseImages() {
        const visualizerStore = this.visualizerStore;
        if (!visualizerStore) return this.loadedBaseImages;
        return this.loadedBaseImages.filter(n => visualizerStore.includeNode(n));
    }

    @computed
    get selectedMeshes() : NodeDataWrapper[] {
        const visualizerStore = this.visualizerStore;
        if (!visualizerStore) return [];
        return this.includedMeshes.filter(n => visualizerStore.nodeIsSelected(n));
    }

    @computed
    get unselectedMeshes() : NodeDataWrapper[] {
        const visualizerStore = this.visualizerStore;
        if (!visualizerStore) return this.includedMeshes;
        return this.includedMeshes.filter(n => !visualizerStore.nodeIsSelected(n));
    }

    setVisualizerStore<T extends VisualizerStore>(visualizer: T) {
        this.visualizerStore = visualizer;
        this.visualizerStore.setSpeckleStore(this);
    }
}

export const speckleStore = new SpeckleStore();
