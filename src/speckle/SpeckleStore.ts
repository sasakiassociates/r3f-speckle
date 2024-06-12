import { action, computed, makeObservable, observable } from "mobx";
import type { NodeDataWrapper } from "./NodeDataWrapper";
import type { VisualizerStore } from "../store";
import type { AppearanceStore } from "../store";

export class SpeckleStore {
    @observable
    meshes: NodeDataWrapper[] = [];

    @observable
    lines: NodeDataWrapper[] = [];

    @observable
    baseImages: NodeDataWrapper[] = [];

    @observable
    appearanceStore?: AppearanceStore;

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
        const appearanceStore = this.appearanceStore;
        if (!appearanceStore) return this.loadedLines;
        return this.loadedLines.filter(n => appearanceStore.computeAppearance(n).visible);
    }

    @computed
    get includedMeshes() {
        const appearanceStore = this.appearanceStore;
        if (!appearanceStore) return this.loadedMeshes;
        return this.loadedMeshes.filter(n => appearanceStore.computeAppearance(n).visible);
    }

    @computed
    get includedBaseImages() {
        const appearanceStore = this.appearanceStore;
        if (!appearanceStore) return this.loadedBaseImages;
        return this.loadedBaseImages.filter(n => appearanceStore.computeAppearance(n).visible);
    }

    @computed
    get glowMeshes() : NodeDataWrapper[] {
        const appearanceStore = this.appearanceStore;
        if (!appearanceStore) return [];
        return this.includedMeshes.filter(n => appearanceStore.computeAppearance(n).outerGlow);
    }

    @computed
    get noGlowMeshes() : NodeDataWrapper[] {
        const appearanceStore = this.appearanceStore;
        if (!appearanceStore) return [];
        return this.includedMeshes.filter(n => !appearanceStore.computeAppearance(n).outerGlow);
    }

    setVisualizerStore<T extends AppearanceStore>(appearanceStore: T) {
        this.appearanceStore = appearanceStore;
    }
}

export const speckleStore = new SpeckleStore();
