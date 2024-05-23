import { useThree } from "@react-three/fiber";
import { type EventEmitter, useEventSubscription } from "@strategies/react-events";
import type { CameraControls } from "@react-three/drei";
import { type RefObject, useState } from "react";
import type { ViewerZoomEvents } from "./useZoomControls.ts";

export type ViewModeEvents = {
    setOrtho: void,
    setPerspective: void,
    setView: 'top' | 'side' | '45',//handled in CameraSwitcher
}

export const useViewModeControls = (eventEmitter: EventEmitter<ViewModeEvents>) => {
    const [planViewMode, setPlanViewMode] = useState(false);

    useEventSubscription(eventEmitter, 'setOrtho', () => {
        setPlanViewMode(true);
    });

    useEventSubscription(eventEmitter, "setPerspective", () => {
        setPlanViewMode(false);
    });

    return [planViewMode];
};
