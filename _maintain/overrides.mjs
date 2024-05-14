const replaceUnwantedHeaders = (fileContent) => {
    fileContent = fileContent.replace("import { NodeData } from '../tree/WorldTree'\n", "");
    fileContent = fileContent.replace("import Logger from 'js-logger'", "import { Logger } from '../vendor/Logger.ts'");
    fileContent = fileContent.replace("import { SpeckleObject } from '../tree/DataTree'\n", "import { SpeckleObject } from './types.ts';");
    return fileContent;
};

export {
    replaceUnwantedHeaders
}
