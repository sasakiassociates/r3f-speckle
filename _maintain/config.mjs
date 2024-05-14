const rawBase = 'https://raw.githubusercontent.com/specklesystems/speckle-server/d753a92a5cac43f555b622fbc358a7eaf203adbf/packages/viewer/src/modules';
//https://raw.githubusercontent.com/specklesystems/speckle-server/d753a92a5cac43f555b622fbc358a7eaf203adbf/packages/viewer/src/modules/converter/MeshTriangulationHelper.js
const converterDir = rawBase + '/converter/';
const converterFiles = [//commented to prevent accidental overwrite
    // 'GeometryConverter.ts',
    // 'Geometry.ts',
    // 'MeshTriangulationHelper.js',
    // 'Units.js'
    // 'Converter.ts',
];
const rawFiles = [
    ...converterFiles.map(f => converterDir + f)

];

export {
    rawFiles
}
