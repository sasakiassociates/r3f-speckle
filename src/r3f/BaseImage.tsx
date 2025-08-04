import { Box } from "@react-three/drei";
import { useAuthTexture } from './hooks/useAuthTexture.ts';

//NOTE: this is a temporary component, but we'll typically need some kind of base on which to place things...

export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type BaseImageProps = {
    imageUrl: string;
    rectangle: Rect;
    y?: number;
    token?: string;
};

function BaseImage({ imageUrl, rectangle, y = -0.35, token }: BaseImageProps) {
    const texture = useAuthTexture(imageUrl, token);
    if (!texture) return null;

    return (
        <Box
            position={[
                rectangle.x + rectangle.width / 2,
                y,
                rectangle.y - rectangle.height / 2,
            ]}
            scale={[rectangle.width, 0.01, rectangle.height]}
        >
            <meshBasicMaterial attach="material" map={texture} />
        </Box>
    );
}

export default BaseImage;
