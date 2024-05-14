import { Box } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

//NOTE: this is a temporary component, but we'll typically need some kind of base on which to place things...

export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
}


export type BaseImageProps = {
    imageUrl: string;
    rectangle: Rect;
}

function BaseImage({ imageUrl, rectangle }: BaseImageProps) {
    const texture = useLoader(TextureLoader, imageUrl);
    return (
        <Box position={[rectangle.x + rectangle.width / 2, -0.35, rectangle.y - rectangle.height / 2]}
             scale={[rectangle.width, 0.01, rectangle.height]}>
            <meshBasicMaterial attach="material" map={texture}/>
        </Box>
    )
}

export default BaseImage;
