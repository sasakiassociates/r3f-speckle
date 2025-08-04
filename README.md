# r3f-speckle
r3f-speckle provides a wrapper for Speckle ObjectLoader and specific object translation scripts in order to support using Speckle streams in react-three-fiber

## Motivation

### Starting point (SpeckleViewer)

The [Speckle Viewer](https://github.com/specklesystems/speckle-server/tree/main/packages/viewer) component provided by the Speckle team includes some nice features out-of-the-box, however the general approach of an imperative codebase that uses object-level control conflicts with our stateful, reactive approach (mobx + react). While usable at a basic level, a hybrid approach between reactive and imperative paradigms quickly devolves into confusing workarounds and hard-to-debug edge cases. Further, tight-coupling between 3D or DOM elements and code/data makes it harder to reuse imperative code in a simple, composable way. 

The core issue is that there are fundamental differences in how we want to handle changes via filters and state updates (color, visibility etc.) versus what is built in to the Speckle Viewer in a very tightly-coupled way.

### A better approach

React Three Fiber (R3F) is a broadly popular wrapper for Three.js that provides full control over the Three.js codebase in a reactive way and maps precisely to the way we manipulate SVG or HTML DOM elements. Reactive states can thus flow throughout the application without risk of edge cases.

Using React Three Fiber (R3F) over imperative Three.js can lead to a more logical, composable, and maintainable codebase due to several key factors:

* Declarative Approach: focus on the "what" rather than the "how"
* Component-Based Architecture: break things down into reusable, composable components that are easy to understand and reason about
* Observability: tie in to state management (either component-level react states or mobx)
* Lifecycle methods: let react manage component lifecycle (e.g. removing elements when components unmount)
* Integration: reuse react concepts, skills and libraries throughout the application rather than mixing and matching

Challenges:
* While very large, the r3f community is smaller than the pure three.js one in terms of finding solutions to issues. 
* r3f is newer so AI code-assist may not be as comprehensive.
* Many examples are in pure three.js and need to be translated.
* Some concepts (such as reusing materials) are harder to generalize into an atomic approach


## Relationship to Speckle Viewer Source

This approach rips out only the minimal Speckle code for converting Speckle to Three.js

All unnecessary Speckle dependencies are purged.

This may require upkeep, but only of a few core files.

All files from speckle are in the [speckle](src%2Fspeckle) folder and contain a link to the source code at the top.

The [_maintain](_maintain) scripts can be used to grab the latest speckle code and apply some reasonable overrides. Take care not to override modified local files. There will likely be manual effort required for each update to fix TS errors or unwanted dependencies.

If needed (though these are unlikely to change) manually update these to TS (or use ChatGPT):
* [Units.js](src%2Fspeckle%2Fmodules%2Fconverter%2FUnits.js)
* [MeshTriangulationHelper.js](src%2Fspeckle%2Fmodules%2Fconverter%2FMeshTriangulationHelper.js)


## Using r3f-speckle

### Consuming speckle data
Each specific implementation should extend the abstract `SpeckleLoader` and override `processSpeckleData`:

For every data-connected 3D object, we then make a `NodeDataWrapper` and add it to the `speckleStore`
```
    for (let item of data['Parcels']) {
        const parcelWrapper = new NodeDataWrapper(loader, item, { itemId });
        speckleStore.addMesh(parcelWrapper);        
    }    
```

Though speckle bundles data and geometry, in our application we very intentionally de-couple the data and our 3D representation of that data. This is because we consider the 3D viewer just one of potentially many views on that data. The only necessary connection is a single ID to link between data state and 3D view representation.

In addition to adding to the `speckleStore` we likely extract a data schema and add elements. The data structure depends on decisions made in Grasshopper or other connectors. This is handled independent of this module, but an example usage may look like this:

```
const data: DataSchema = {
    buildings: extractBuildings(speckleData['@Buildings']),
};

extractBuildings(speckleArr: any) {
    return speckleArray(speckleArr).map((p: any, i: number) => {
        return {
            id: p.buildingID,
            floorplanIds: p.floorplans.Items,
        };
    });
}
```

### VisualizerStore
This class links to speckleStore and helps manage object states. It primarily manages interpreting the current state for each NodeDataWrapper object. For example the current color of the object is managed by providing a `colorById` lookup.

```
    let id = visualizerStore.getId(geometry);
    return visualizerStore.colorById[id] || '#ffffff';
```

### Viewing in 3D
Include the Viewer. Currently a "global" `speckleStore` object is used to connect everything so no data context needs to be passed. 
```
 <Viewer
    planViewMode={true}
    cameraStore={mainStore.cameraStore}
    baseImages={[
        { imageUrl: baseImgUrl, rectangle: baseImgRect }
    ]}/>
```
Note: use of the global speckleStore is likely to change if we need more sophisticated, composable integrations with multiple viewers. 


### Dev Notes

#### Publishing local 
(total time <1 minute)

Here:
1. Run esbuild
2. Increment build num e.g. `-b.3` 
3. Run localPub

In target solution:
1. Run _maintenance/updateLocalReferences.js
2. Restart dev server
   Note if the dev server hangs after an update, it can be helpful to run build, then start it again
