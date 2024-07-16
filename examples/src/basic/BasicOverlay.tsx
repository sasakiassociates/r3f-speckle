import { observer } from "mobx-react-lite";
import { mainStore } from "../core/MainStore.ts";

export default observer(function ViewerOverlay({}: {}) {
    let positionLookup = mainStore.screenPositions;

    return <svg id={'viewer-overlay'}
                width={3200} height={1800}
                className={'viewer-overlay'}
    >
        {positionLookup && Object.keys(positionLookup).map(k =>
            <g transform={`translate(${positionLookup[k].x},${positionLookup[k].y})`}>
                <circle r={5}/>
            </g>
        )}
    </svg>
});
