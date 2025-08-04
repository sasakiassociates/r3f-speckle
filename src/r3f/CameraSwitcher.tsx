import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { PerspectiveCamera, OrthographicCamera, Vector3 } from 'three';
import { type EventEmitter, useEventSubscription } from "@strategies/react-events";
import CameraControlsLib from 'camera-controls';
import type { MouseButtons } from "camera-controls/dist/types";
import { computeBoundingSphere } from "../three";

export type ViewModeEvents = {
    setView: 'top' | 'side' | '45',//handled in CameraSwitcher
    requestViewState: (state: string) => void,
    restoreView: {viewJson: string, transition: boolean}
}

type CameraSwitcherProps = {
    eventEmitter: EventEmitter<ViewModeEvents>,
    settings: CameraControlSettings
}

export type CameraControlSettings = {
    orthoMode: boolean;
    useSimplifiedPanning: boolean;
    initialView?: string
}

export const CameraSwitcher: React.ForwardRefExoticComponent<React.PropsWithoutRef<CameraSwitcherProps> & React.RefAttributes<CameraControls>> = forwardRef<CameraControls, CameraSwitcherProps>(({
                                                                                                                                                                                                      settings,
                                                                                                                                                                                                      eventEmitter
                                                                                                                                                                                                  }, ref) => {

    const { orthoMode, useSimplifiedPanning } = settings;
    const { set, scene, viewport } = useThree();

    const perspControlsRef = useRef<CameraControls>(null);
    const orthoControlsRef = useRef<CameraControls>(null);

    // Refs to store the camera instances
    const perspCamRef = useRef<PerspectiveCamera>(new PerspectiveCamera(75, viewport.width / viewport.height, 1, 10000));
    const orthoCamRef = useRef<OrthographicCamera>(new OrthographicCamera(
        viewport.width / -2,
        viewport.width / 2,
        viewport.height / 2,
        viewport.height / -2,
        5,
        50000
    ));

    useImperativeHandle(ref, () => orthoMode ? orthoControlsRef.current! : perspControlsRef.current!);

    useEventSubscription(eventEmitter, 'setView', (view) => {
        const { sphere } = computeBoundingSphere(scene);
        const { radius } = sphere;
        const position = new Vector3();
        const lookAt = new Vector3();
        lookAt.copy(sphere.center);
        if (view === '45') {
            const angle = Math.PI / 4; // 45 degrees in radians

            position.set(sphere.center.x + radius * 2 * Math.cos(angle), sphere.center.y + radius * 2 * Math.sin(angle), sphere.center.z + radius * 2 * Math.sin(angle));

        }
        if (view === 'top') {
            position.set(sphere.center.x, sphere.center.y + radius, sphere.center.z);
        }

        if (view === 'side') {
            position.set(sphere.center.x, sphere.center.y, sphere.center.z + radius);
        }

        const cameraControls = orthoMode ? orthoControlsRef.current : perspControlsRef.current;
        if (cameraControls) {
            (async () => {
                await Promise.all([
                    cameraControls.setLookAt(position.x, position.y, position.z, lookAt.x, lookAt.y, lookAt.z, true),
                    cameraControls.fitToSphere(sphere, true)
                ])
            })();
        }

    });

    useEventSubscription(eventEmitter, 'requestViewState', (withState: (state:string)=> void) => {
        const cameraControls = orthoMode ? orthoControlsRef.current : perspControlsRef.current;
        if (cameraControls) {
            withState(cameraControls.toJSON());
        }
    });

    useEventSubscription(eventEmitter, 'restoreView', ({viewJson, transition}) => {
        const cameraControls = orthoMode ? orthoControlsRef.current : perspControlsRef.current;
        if (cameraControls) {
            cameraControls.fromJSON(viewJson, transition);
        }
    });

    useEffect(() => {
        if (!settings.initialView) return;
        const cameraControls = orthoMode ? orthoControlsRef.current : perspControlsRef.current;
        if (cameraControls) {
            cameraControls.fromJSON(settings.initialView, false);
        }
    }, [settings.initialView]);

    useEffect(() => {
        if (orthoMode) {
            const orthoCamera = orthoCamRef.current;
            set({ camera: orthoCamera });
        } else {
            const perspCamera = perspCamRef.current;
            set({ camera: perspCamera });
        }
    }, [orthoMode, set]);

    let orthoButtons: MouseButtons = {
        left: CameraControlsLib.ACTION.ROTATE,
        middle: CameraControlsLib.ACTION.ZOOM,
        right: CameraControlsLib.ACTION.TRUCK,
        wheel: CameraControlsLib.ACTION.ZOOM,
    };
    if (useSimplifiedPanning) {
        orthoButtons = {
            left: CameraControlsLib.ACTION.TRUCK,
            middle: CameraControlsLib.ACTION.ZOOM,
            right: CameraControlsLib.ACTION.ROTATE,
            wheel: CameraControlsLib.ACTION.ZOOM,
        }
    }
    return <>
        <CameraControls
            ref={perspControlsRef}
            camera={perspCamRef.current}
            enabled={!orthoMode}
        />
        <CameraControls
            ref={orthoControlsRef}
            camera={orthoCamRef.current}
            enabled={orthoMode}
            mouseButtons={orthoButtons}
            minZoom={0.001}
        />
    </>;
});
