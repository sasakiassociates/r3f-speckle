import { View } from "@react-three/drei";
import SpeckleScene from "@strategies/r3f-speckle/r3f/SpeckleScene.tsx";
import { Canvas } from "@react-three/fiber";
import { MapControls, Toolbar } from "../basic/Toolbar.tsx";
import { observer } from "mobx-react-lite";
import { useRef } from "react";

export const MultiView = observer(() => {
    const ref = useRef<HTMLDivElement>(null)
    const mapControls = useRef(new MapControls());
    //TODO we need to provide a more flexible approach to cameras and views and how they work with content in r3f.
    //  we can use drei's View object

    //based off https://codesandbox.io/p/sandbox/view-skissor-2-v5i9wl?file=%2Fsrc%2FApp.js%3A13%2C30
    //TODO we need to figure out how views relate to the DOM elements and how to use them effectively in our React solutions

   return <div ref={ref} className={'canvas-parent'}>
        <View index={1} className="view1">
            <color attach="background" args={['#f0f0f0']}/>
            <SpeckleScene cameraController={mapControls.current} baseImages={[]}/>
        </View>
        <View index={2} className="view2">
            <color attach="background" args={['#d6edf3']}/>
            <SpeckleScene cameraController={mapControls.current} baseImages={[]}/>
        </View>
        <Canvas eventSource={ref.current!} className="canvas">
            <View.Port/>
        </Canvas>
        <Toolbar mapControls={mapControls.current}/>
    </div>;
});
