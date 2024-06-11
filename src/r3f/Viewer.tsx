import React from 'react'
import { Canvas } from '@react-three/fiber';
import { observer } from "mobx-react-lite";
import { useMemo, useRef } from "react";
import {
    BufferGeometry,
    LineBasicMaterial,
    EdgesGeometry,
    type OrthographicCamera,
    type PerspectiveCamera
} from "three";
import { Line2, LineMaterial, LineSegmentsGeometry } from 'three-stdlib';

import { useControls } from 'leva';
import SpeckleScene, { type CameraController } from "./SpeckleScene";
import type { BaseImageProps } from "./BaseImage.tsx";

type LineProps = {
    bufferGeometry: BufferGeometry;
};
const BufferLine = ({ bufferGeometry }: LineProps) => {
    const { color, polygonOffsetFactor, polygonOffsetUnits } = useControls({
        color: '#ffffff',
        polygonOffsetFactor: { value: 1, min: 0, max: 500, step: 0.1 },
        polygonOffsetUnits: { value: 1, min: 0, max: 500, step: 0.1 },
    });

    const lineMaterial = useMemo(() => new LineBasicMaterial({
        color,
        polygonOffset: polygonOffsetFactor > 0,
        polygonOffsetFactor, // Adjust these values as needed
        polygonOffsetUnits,
    }), [color, polygonOffsetFactor, polygonOffsetUnits]);

    let material = new LineMaterial({
        color: 0xffffff,
        linewidth: 0.01, // width of the line
        transparent: true,
        opacity: 0.5
    });

    let edgesGeometry = new EdgesGeometry(bufferGeometry);

    let lineSegmentsGeometry = new LineSegmentsGeometry().fromEdgesGeometry(edgesGeometry);


    // @ts-ignore
    // let line = new Line(bufferGeometry, lineMaterial);
    let line = new Line2(lineSegmentsGeometry, material);
    return <primitive object={line}/>;
};

//TODO why are base images treated differently from meshes and lines? I guess they currently are manually specified
//but when they come in from Speckle we should treat them like other Speckle elements
type ViewerProps = {
    cameraController: CameraController,
    baseImages: BaseImageProps[]
};
export const Viewer = observer((props: ViewerProps) => {
    const { cameraController, baseImages } = props;
    // let palette = fillColors();
    //keep track of how many times this has rendered
    const renderCount = useRef(0);
    const { toneMapping } = useControls({
        toneMapping: false,
    });

    renderCount.current++;
    const nextColor = () => {
        // if (palette.length === 0) {
        //     palette = fillColors();
        // }
        // return palette.pop()!;
        // return '#ffd920';
        return '#d781d7';
    }
    return (
        <div className={'canvas-parent'}>
            <Canvas
                shadows
                // defaultCamera
                // camera={{ position: [0, 60, 0], fov: cameraStore.fov, far: cameraStore.farClip }}
                // onCreated={({ camera }) => cameraStore?.setCamera(camera)}
                flat={!toneMapping}
            >
                <axesHelper args={[100]}/>
                {/*<ambientLight color={'#cccccc'}/>*/}
                {/*<directionalLight intensity={2} color={'white'} position={[100, 100, 10]}/>*/}
                {/*<SpeckleStage>*/}


                {/*</SpeckleStage>*/}
                {/*<Scene/>*/}
                {/*<ShadowScene minimumGroundY={-2}/>*/}
                {/*<LayersTest/>*/}
                {/*<ShadowGroupScene/>*/}
                <SpeckleScene cameraController={cameraController} baseImages={baseImages}/>
            </Canvas>
        </div>
    );
});
