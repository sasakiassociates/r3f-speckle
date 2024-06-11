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
}

type CameraSwitcherProps = {
    eventEmitter: EventEmitter<ViewModeEvents>,
    settings: CameraControlSettings
}

export type CameraControlSettings = {
    orthoMode: boolean;
    useSimplifiedPanning: boolean
}

export const CameraSwitcher: React.ForwardRefExoticComponent<React.PropsWithoutRef<CameraSwitcherProps> & React.RefAttributes<CameraControls>> = forwardRef<CameraControls, CameraSwitcherProps>(({
                                                                                                                                                                                                      settings,
                                                                                                                                                                                                      eventEmitter
                                                                                                                                                                                                  }, ref) => {

    const { orthoMode, useSimplifiedPanning } = settings;
    const { set, scene, camera } = useThree();

    const perspControlsRef = useRef<CameraControls>(null);
    const orthoControlsRef = useRef<CameraControls>(null);

    // Refs to store the camera instances
    const perspCamRef = useRef<PerspectiveCamera>(new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));
    const orthoCamRef = useRef<OrthographicCamera>(new OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0.0001,
        10000
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


    useEffect(() => {
        if (orthoMode) {
            const orthoCamera = orthoCamRef.current;
            set({ camera: orthoCamera });
        } else {
            const perspCamera = perspCamRef.current;
            set({ camera: perspCamera });
        }
    }, [orthoMode, set]);

    // useEffect(() => {
    //     if (controlsRef.current) {
    //         controlsRef.current.update(1);//Note sure what to use for delta
    //     }
    // }, [camera]);

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
        />
    </>;
});
