/**
 * CameraStore
 * to manage camera state, including camera position, so as to
 * control the zoom in and out of the camera.
 */
import { action, computed, makeObservable, observable } from "mobx";
import type { PerspectiveCamera, OrthographicCamera } from 'three';

type CameraType = PerspectiveCamera | OrthographicCamera | undefined;

export class CameraStore {
    constructor() {
        makeObservable(this);
        this.camera = undefined;
    }

    @observable
    camera: CameraType;
    @observable
    zoomStep: number = 10;

    @action
    setCamera(cam: CameraType) {
        this.camera = cam;
    }

    @action
    zoomIn() {
        if (!this.camera) {
            console.error('❌Camera is not defined');
            return;
        }

        this.camera.position.y -= this.zoomStep;
        this.camera.updateProjectionMatrix();
    }

    @action
    zoomOut() {
        if (!this.camera) {
            console.error('❌Camera is not defined');
            return;
        }

        this.camera.position.y += this.zoomStep;
        this.camera.updateProjectionMatrix();
    }
}
