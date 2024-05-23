import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { PerspectiveCamera, OrthographicCamera } from 'three';
import { type EventEmitter, useEventSubscription } from "@strategies/react-events";
import { computeBoundingSphere } from "../three";
import type { ViewModeEvents } from "./hooks/useViewModeControls.ts";

// Define the props interface
interface CameraSwitcherProps {
    planViewMode: boolean;
    eventEmitter:EventEmitter<ViewModeEvents>
}

export const CameraSwitcher: React.ForwardRefExoticComponent<React.PropsWithoutRef<CameraSwitcherProps> & React.RefAttributes<CameraControls>> = forwardRef<CameraControls, CameraSwitcherProps>(({ planViewMode, eventEmitter }, ref) => {

    const { set, camera } = useThree();
    const controlsRef = useRef<CameraControls>(null);

    // Refs to store the camera instances
    const perspCamRef = useRef<PerspectiveCamera>(new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
    const orthoCamRef = useRef<OrthographicCamera>(new OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0.1,
        10000
    ));

    useImperativeHandle(ref, () => controlsRef.current!);


    useEventSubscription(eventEmitter, 'setView', (view) => {
        if (view === '45') {
            if (planViewMode) {
                // Configure the orthographic camera if needed
                const aspect = window.innerWidth / window.innerHeight;
                const frustumSize = 100;
                const orthoCamera = orthoCamRef.current;
                orthoCamera.left = frustumSize * aspect / -2;
                orthoCamera.right = frustumSize * aspect / 2;
                orthoCamera.top = frustumSize / 2;
                orthoCamera.bottom = frustumSize / -2;
                orthoCamera.updateProjectionMatrix();
                orthoCamera.position.set(0, 0, 500);
                orthoCamera.lookAt(0, 0, 0);
                set({ camera: orthoCamera });
                if (controlsRef.current) {
                    controlsRef.current.update(1);//Note sure what to use for delta
                }
            } else {
                // Configure the perspective camera if needed
                const perspCamera = perspCamRef.current;
                // perspCamera.aspect = window.innerWidth / window.innerHeight;
                // perspCamera.updateProjectionMatrix();
                // perspCamera.position.set(0, 0, 5);
                // perspCamera.lookAt(0, 0, 0);
                set({ camera: perspCamera });
            }
        }
    });


    useEffect(() => {
        if (planViewMode) {
            const orthoCamera = orthoCamRef.current;
            set({ camera: orthoCamera });
        } else {
            const perspCamera = perspCamRef.current;
            set({ camera: perspCamera });
        }
    }, [planViewMode, set]);

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.update(1);//Note sure what to use for delta
        }
    }, [camera]);

    return <CameraControls ref={controlsRef} />;
});
