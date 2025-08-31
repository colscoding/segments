import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchSegmentById(segmentId) {
    const dir = path.join(__dirname, 'segment-pages');
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${segmentId}.html`);
    try {
        await fs.access(filePath);
        const existingContent = await fs.readFile(filePath, 'utf8');
        return existingContent;
    } catch (err) {
    }

    const baseUrl = "https://www.strava.com/segments/";
    const response = await fetch(`${baseUrl}${segmentId}`);
    if (!response.ok) {
        // throw new Error(`Failed to fetch segment: ${response.status}`);
        return;
    }
    const txt = await response.text();
    await fs.writeFile(filePath, txt, 'utf8');
    // sleep 10 seconds to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 10000));
    return txt;
}

export { fetchSegmentById };