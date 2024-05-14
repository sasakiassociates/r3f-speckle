import { Box, CameraControls, Plane } from "@react-three/drei";
import { ShadowGroup } from "./ShadowGroup";
import { useControls } from "leva";

function Scene() {
    const { lightPosition, showHelper, shadowMapResolution } = useControls({
        lightPosition: { value: [3, 5, 2], label: 'vec' },
        showHelper: false,
        shadowMapResolution: { value: 9, min: 4, max: 12, step: 1 },
    });
    const shadowMapSize = Math.pow(2, shadowMapResolution) as (512 | 1024 | 2048 | 4096);
    const groundY = 0;
    return <>
        <ambientLight color={'#444'}/>
        <pointLight position={[0, 10, 2]} intensity={20}/>
        <pointLight position={[0, 10, 20]} intensity={20}/>
        <CameraControls/>
        <ShadowGroup lightPosition={lightPosition} showHelper={showHelper} mapSize={shadowMapSize} minimumGroundY={groundY}>
            <Box castShadow position={[0, -0.03, 0]} scale={[0.2, 0.2, 0.2]}>
                <meshStandardMaterial color="teal"/>
            </Box>
            <Box castShadow position={[6, 0, 10]}>
                <meshStandardMaterial color="purple"/>
            </Box>
            <Box castShadow position={[16, 0, 10]}>
                <meshStandardMaterial color="purple"/>
            </Box>
            <Box castShadow position={[8, 2, 5]}>
                <meshStandardMaterial color="purple"/>
            </Box>
            <Box castShadow position={[3, 0, 16]}>
                <meshStandardMaterial color="orange"/>
            </Box>
        </ShadowGroup>
        <Plane receiveShadow scale={[50, 50, 0.3]} position={[0, groundY, 1]}
               rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#ffcc99"/>
        </Plane>
    </>
}

export default Scene;
