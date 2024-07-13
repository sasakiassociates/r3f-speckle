import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {rawFiles} from "./config.mjs";
import {replaceUnwantedHeaders} from "./overrides.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCAL_BASE_PATH = path.join(__dirname, './incoming');
const deriveLocalPath = (url) => {
    const srcIndex = url.indexOf('/src/');
    if (srcIndex === -1) {
        throw new Error('The URL does not contain /src/');
    }
    const relativePath = url.substring(srcIndex + 5); // +5 to skip '/src/' itself
    return path.join(LOCAL_BASE_PATH, relativePath);
};

const modifyContent = (content)=> {
    content = replaceUnwantedHeaders(content);
    return content;
}

const downloadFile = async (url, outputPath) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        let content = await response.text();
        content = modifyContent(content);

        // Ensure the directory exists
        const directory = path.dirname(outputPath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        fs.writeFileSync(outputPath, content);
        console.log(`File downloaded and saved to ${outputPath}`);
    } catch (error) {
        console.error(`Error downloading the file: ${error.message}`);
    }
};

for (let rawPath of rawFiles) {

    const localPath = deriveLocalPath(rawPath);
    downloadFile(rawPath, localPath);

}
