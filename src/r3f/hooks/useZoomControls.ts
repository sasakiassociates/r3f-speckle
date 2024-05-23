import { useThree } from "@react-three/fiber";
import {
    computeBoundingSphere,
    computeBoundingSphereMulti
} from "../../three";
import { type EventEmitter, useEventSubscription } from "@strategies/react-events";
import type { NodeDataWrapper } from "../../speckle";
import type { CameraControls } from "@react-three/drei";
import type { RefObject } from "react";

export type ViewerZoomEvents = {
    zoomExtents: void,
    zoomToSelected: void,
    zoomIn: number,
    zoomOut: number
}

export const useZoomControls = (controls:RefObject<CameraControls>, eventEmitter: EventEmitter<ViewerZoomEvents>, selectedNodes: NodeDataWrapper[]) => {
    const { scene, camera } = useThree();

    useEventSubscription(eventEmitter, 'zoomExtents', () => {
        if (!controls.current) return;
        const { sphere } = computeBoundingSphere(scene);
        controls.current.fitToSphere(sphere, true, );
        // adjustCameraToFitBox(camera as PerspectiveCamera, controls.current, box);
    });

    useEventSubscription(eventEmitter, "zoomToSelected", () => {
        if (!controls.current) return;
        if (selectedNodes.length === 0) return;
        //NOTE this uses raw meshGeometry and doesn't account for transforms
        const { sphere } = computeBoundingSphereMulti(selectedNodes.map(n => n.meshGeometry!));
        controls.current.fitToSphere(sphere, true);
    });

    useEventSubscription(eventEmitter, 'zoomIn', (amount: number) => {
        controls.current?.dolly(amount, true)
    });

    useEventSubscription(eventEmitter, 'zoomOut', (amount: number) => {
        controls.current?.dolly(-amount, true)
    });

};
