/**
 * https://threejs.org/docs/#examples/en/controls/OrbitControls
 * wrapper for OrbitControls from three.js
 * with custom mouse button mapping
 * since OrbitControls from r3f drei does not support changing mouse buttons
 */

import React, { useRef, useEffect } from 'react';
import { Canvas, extend, useThree } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls} from '@react-three/drei';
import * as THREE from 'three';

type PlanViewOrbitControlsProps = React.ComponentProps<typeof DreiOrbitControls>;
type Controls = typeof DreiOrbitControls & { mouseButtons: { LEFT?: number; MIDDLE?: number; RIGHT?: number } }

export const PlanViewOrbitControls = (props: PlanViewOrbitControlsProps) => {
  const {
    camera,
    gl: { domElement },
  } = useThree();

  const controlsRef  = useRef<typeof DreiOrbitControls>();

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current as Controls;
      // mouse key mappings for Speckle's OrbitControls
      if(!controls?.mouseButtons) return;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        // RIGHT: THREE.MOUSE.ROTATE,
      };
    }
  }, []);

  // @ts-expect-error - ref type is not matched: React.LegacyRef<OrbitControls> | undefined
  return <DreiOrbitControls ref={controlsRef} args={[camera, domElement]} {...props} />;
};
