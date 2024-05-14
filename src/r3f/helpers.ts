import { RefObject, useEffect, useRef } from "react";
import { CameraHelper, DirectionalLight } from "three";
import { useThree } from "@react-three/fiber";

export const useShadowHelper = (lightRef: RefObject<DirectionalLight>, isVisible: boolean) => {
    const { scene } = useThree();
    const helperRef = useRef<CameraHelper | null>(null);

    useEffect(() => {
        if (lightRef.current) {
            if (!helperRef.current) {
                // Create the helper only if it doesn't exist
                helperRef.current = new CameraHelper(lightRef.current.shadow.camera);
                scene.add(helperRef.current);
            }
            // Update visibility based on the isVisible flag
            helperRef.current.visible = isVisible;
        }

        return () => {
            if (helperRef.current) {
                scene.remove(helperRef.current);
                helperRef.current = null;
            }
        };
    }, [lightRef, scene, isVisible]); // Add isVisible as a dependency


    return helperRef;
};
