import {
    AddEquation,
    Color,
    CustomBlending, DoubleSide, MaxEquation, NormalBlending, OneMinusSrcAlphaFactor,
    ShaderMaterial,
    type ShaderMaterialParameters,
    SrcAlphaFactor, SubtractEquation
} from "three";
import { DstAlphaFactor, MultiplyBlending } from "three/src/constants";

interface MeshFlatMaterialParameters extends ShaderMaterialParameters {
    color?: Color | string | number;
    opacity?: number;
    maxOpacity?: number;
}

//NOTE: trying to get a flat material that never renders too strong with opacity, but was not too successful

export class MeshFlatMaterial extends ShaderMaterial {
    color: Color;
    maxOpacity: number;
    opacity: number;

    constructor(params: MeshFlatMaterialParameters) {
        const color = new Color(params.color || 0xffffff);
        const opacity = params.opacity !== undefined ? params.opacity : 1.0;
        const maxOpacity = params.maxOpacity !== undefined ? params.maxOpacity : 1.0;

        super({
            uniforms: {
                color: { value: color },
                opacity: { value: opacity },
                maxOpacity: { value: maxOpacity }
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        uniform float maxOpacity;
        varying vec2 vUv;
        void main() {
          vec4 baseColor = vec4(color, opacity);
          baseColor.a = min(baseColor.a, maxOpacity);
          gl_FragColor = baseColor;
        }
      `,
            transparent: true,
            // depthWrite: false,
            // depthTest: false,
            blending: CustomBlending,
            blendEquation: AddEquation,
            blendSrc: SrcAlphaFactor,
            blendDst: OneMinusSrcAlphaFactor,
            blendEquationAlpha: MaxEquation // Use the max equation for alpha to cap the opacity
        });

        // Optional: Store parameters for later use
        this.color = color;
        this.opacity = opacity;
        this.maxOpacity = maxOpacity;

        this.side = DoubleSide
    }
}
