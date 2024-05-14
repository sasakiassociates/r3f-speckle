import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { DirectionalLight, Layers, PointLight } from "three";
import { CameraControls } from "@react-three/drei";
import { useControls } from "leva";

// extend({BoxBufferGeometry});

const asLayers = (layerNums: number[]) => {
    const layers = new Layers();
    layers.set(layerNums[0]);//will disable all other layers
    for (let i = 1; i < layerNums.length; i++) {
        const layerNum = layerNums[i];
        layers.enable(layerNum);
    }
    return layers;
};

function LightingSetup() {
    const light1Ref = useRef<DirectionalLight>(null);
    const light2Ref = useRef<DirectionalLight>(null);

    const { intensity } = useControls({
        intensity: 10,
    });
    const { light1, light2 } = useControls({
        light1: true,
        light2: true,
    });

    const unoDos = asLayers([1, 2]);

    useEffect(() => {
        light1Ref.current?.layers.set(1);
        light2Ref.current?.layers.set(2);
    }, []);

    //layers={asLayers([1])}

    return (
        <>
            <ambientLight color={'#444'}/>
            <pointLight position={[0, 3, 2]} intensity={10}/>
            <pointLight layers={unoDos} position={[1.4, 2, 3]} intensity={intensity}/>
            <pointLight layers={unoDos} position={[2, 2, 3]} intensity={intensity}/>

            {light1 && <directionalLight ref={light1Ref} color={'#c00'} castShadow intensity={0.5}
                                         position={[0, 4, 4]}
            />}

            {light2 && <directionalLight ref={light2Ref} color={'#00c'} castShadow intensity={0.5}
                                         position={[0, 4, 4]}
            />}
        </>
    )
        ;
}

function Scene() {
    const { camera } = useThree();

    const { layer0, layer1, layer2 } = useControls({
        layer0: true,
        layer1: true,
        layer2: true,
    });

    // Ensure the camera renders both layers
    useEffect(() => {
        layer0 ? camera.layers.enable(0) : camera.layers.disable(0);
        layer1 ? camera.layers.enable(1) : camera.layers.disable(1);
        layer2 ? camera.layers.enable(2) : camera.layers.disable(2);
    }, [camera, layer0, layer1, layer2]);

    const unoDos = asLayers([1, 2]);

    //in theory, the layers applied to the directionalLights should affect which objects get lit
    //and get included in the shadow maps, but currently all visible objects appear to get shadows

    //this seems pretty definitive:https://discourse.threejs.org/t/layers-and-lights/4155/3 at least back in 2018
    //in that case, this is totally bogus: https://chat.openai.com/c/25333c97-f0ad-4bd1-a7d0-1bbe9cad2ae1


    return (
        <>
            <mesh castShadow layers={1} position={[-2.05, 0, 0]}>
                <boxGeometry/>
                <meshStandardMaterial color="#ffaa99"/>
            </mesh>

            <mesh castShadow layers={unoDos} position={[-1, 0, 0]}>
                <boxGeometry/>
                <meshStandardMaterial color="#ffaa99"/>
            </mesh>

            <mesh castShadow layers={2} position={[1, 0, 0]}>
                <boxGeometry/>
                <meshStandardMaterial color="#ff0099"/>
            </mesh>

            {/*NOT working to cascade from groups currently*/}
            <group>
                <mesh castShadow layers={asLayers([0])} position={[4, 0, 0.9]}>
                    <boxGeometry/>
                    <meshStandardMaterial color="#6600CC"/>
                </mesh>
                <mesh castShadow layers={asLayers([1])} position={[4, 0, 2]}>
                    <boxGeometry/>
                    <meshStandardMaterial color="#6600CC"/>
                </mesh>
                <mesh castShadow layers={asLayers([2])} position={[4, 0, 3.1]}>
                    <boxGeometry/>
                    <meshStandardMaterial color="#6600CC"/>
                </mesh>
            </group>

            <mesh receiveShadow layers={asLayers([0, 1, 2])} scale={[10, 0.01, 10]} position={[0, -0.5, 0]}>
                <boxGeometry/>
                <meshStandardMaterial color="#ff99cc"/>
            </mesh>


            <LightingSetup/>

            <CameraControls/>

        </>
    );
}

export default Scene;
