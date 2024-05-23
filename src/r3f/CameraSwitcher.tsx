import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { PerspectiveCamera, OrthographicCamera } from 'three';
import { type EventEmitter, useEventSubscription } from "@strategies/react-events";
import { computeBoundingSphere } from "../three";
import CameraControlsLib from 'camera-controls';
import type { MouseButtons } from "camera-controls/dist/types";

export type ViewModeEvents = {
    setView: 'top' | 'side' | '45',//handled in CameraSwitcher
}

type CameraSwitcherProps = {
    eventEmitter:EventEmitter<ViewModeEvents>,
    settings: CameraControlSettings
}

export type CameraControlSettings = {
    orthoMode: boolean;
    useSimplifiedPanning: boolean
}

export const CameraSwitcher: React.ForwardRefExoticComponent<React.PropsWithoutRef<CameraSwitcherProps> & React.RefAttributes<CameraControls>> = forwardRef<CameraControls, CameraSwitcherProps>(({ settings, eventEmitter }, ref) => {

    const { orthoMode, useSimplifiedPanning } = settings;
    const { set, camera } = useThree();
    const perspControlsRef  = useRef<CameraControls>(null);
    const orthoControlsRef   = useRef<CameraControls>(null);

    // Refs to store the camera instances
    const perspCamRef = useRef<PerspectiveCamera>(new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));
    const orthoCamRef = useRef<OrthographicCamera>(new OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0.1,
        10000
    ));

    useImperativeHandle(ref, () => orthoMode ? orthoControlsRef.current! : perspControlsRef.current!);

    useEventSubscription(eventEmitter, 'setView', (view) => {
        //note that these do not frame the view. they need to be combined with a zoomExtents event
        if (view === '45') {
            if (orthoMode) {
                orthoControlsRef.current?.moveTo(10,5,10, true)
                orthoControlsRef.current?.lookInDirectionOf(0,0,0, true)
                //Not sure why we need the dolly, but it fixes a positioning issue
                orthoControlsRef.current?.dolly(-5);

            } else {
                perspControlsRef.current?.moveTo(10,5,10, true)
                perspControlsRef.current?.lookInDirectionOf(0,0,0, true)
                perspControlsRef.current?.dolly(-5);
            }
        }
        if (view === 'top') {
            if (orthoMode) {
                orthoControlsRef.current?.moveTo(0,1,0, true)
                orthoControlsRef.current?.lookInDirectionOf(0,0,0, true)
                orthoControlsRef.current?.dolly(-5);

            } else {
                perspControlsRef.current?.moveTo(0,1,0, true)
                perspControlsRef.current?.lookInDirectionOf(0,0,0, true)
                perspControlsRef.current?.dolly(-5);

            }
        }
        if (view === 'side') {
            if (orthoMode) {
                orthoControlsRef.current?.moveTo(1,0,0, true)
                orthoControlsRef.current?.lookInDirectionOf(0,0,0, true)
                orthoControlsRef.current?.dolly(-5);

            } else {
                perspControlsRef.current?.moveTo(1,0,0, true)
                perspControlsRef.current?.lookInDirectionOf(0,0,0, true)
                perspControlsRef.current?.dolly(-5);

            }
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
