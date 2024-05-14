import { Box3, DirectionalLight, Group } from "three";
import { ReactNode, useEffect, useRef } from "react";
import { calculateCameraAlignedBounds } from "../three/cameraMath";
import { intersectGroundPlane } from "../three/raycasting";
import type { V3 } from "./types";
import { useShadowHelper } from "./helpers";

//The ShadowGroup r3f component is a simple way to include a group of objects that need to be included in a shadow map
// the component will automatically update the shadow camera's frustrum so that we don't waste pixels outside the shadow box. This helps keep shadows looking crisp.

type ShadowGroupProps = {
    lightPosition: V3,
    mapSize?: 512 | 1024 | 2048 | 4096,
    /** if specified, bounding box values below this will be ignored */
    minimumGroundY?: number,
    /** when lights get low, the far extent can push out really far causing artifacts. this provides some control. */
    maxFarExtents?: number,
    /**
     layers bitmask that can be used to control which objects are included in the shadow map
     providing this at the group level gives us a handy way to set up multiple ShadowGroups that work independently: for example one for context and another for design geometry
     */
    layers?: number,
    showHelper?: boolean,
    children: ReactNode
};

//basic props used in order to run calcs
const defaultCameraProps = {
    near: 0,
    far: 100,
    left: -50,
    right: 50,
    top: 50,
    bottom: -50,
};

export const ShadowGroup = ({
                                lightPosition,
                                children,
                                layers,
                                mapSize = 1024,
                                showHelper,
                                minimumGroundY = 0,
                                maxFarExtents = 1000
                            }: ShadowGroupProps) => {

    const lightRef = useRef<DirectionalLight>(null);
    const boxesRef = useRef<Group>(null);

    const boundingBoxCalc = useRef<Box3>(new Box3());

    const helperRef = useShadowHelper(lightRef, !!showHelper);

    useEffect(() => {
        if (showHelper && helperRef.current) {
            helperRef.current.update();
        }
    }, [showHelper]);

    useEffect(() => {
        if (lightRef.current) {
            const shadowCamera = lightRef.current.shadow.camera;

            if (boxesRef.current) {
                //reset props in order to run calcs
                Object.assign(shadowCamera, defaultCameraProps);
                shadowCamera.updateProjectionMatrix();
                boundingBoxCalc.current = calculateCameraAlignedBounds(boxesRef.current, lightRef.current);
            }

            const shadowCameraProps = {
                far: -boundingBoxCalc.current.min.z,
                near: -boundingBoxCalc.current.max.z,
                left: boundingBoxCalc.current.min.x,
                right: boundingBoxCalc.current.max.x,
                top: boundingBoxCalc.current.max.y,
                bottom: boundingBoxCalc.current.min.y
            };

            Object.assign(shadowCamera, shadowCameraProps);
            shadowCamera.updateProjectionMatrix();

            const { intersection, distance } = intersectGroundPlane(shadowCamera, minimumGroundY);

            if (intersection) {
                if (distance != 0) {
                    const farAtGround = shadowCamera.far + distance;
                    shadowCamera.far = Math.min(farAtGround, maxFarExtents);
                    shadowCamera.updateProjectionMatrix();
                }
            }

            lightRef.current.shadow.mapSize.width = mapSize;
            lightRef.current.shadow.mapSize.height = mapSize;
            lightRef.current.shadow.map?.dispose();
            lightRef.current.shadow.map = null;
        }
    }, [lightPosition, mapSize, minimumGroundY, maxFarExtents]);


    return <group layers={layers}>
        <directionalLight
            ref={lightRef}
            position={lightPosition}
            castShadow
        />
        <group ref={boxesRef}>
            {children}
        </group>
    </group>;
}
