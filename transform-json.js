import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchSegmentById } from './download.js';
import { parseHtml } from './parse-html.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'segments.json');

function readAndLogSegments() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const segments = JSON.parse(data);
        return segments;
    } catch (err) {
        return [];
    }
}

function readSegmentsPartialMap() {
    const partialPath = path.join(__dirname, 'segments_partial_392.json');
    try {
        const data = fs.readFileSync(partialPath, 'utf8');
        const segments = JSON.parse(data);
        return segments.reduce((map, segment) => {
            map[segment.id] = segment;
            return map;
        }, {});
    } catch (err) {
        return {};
    }
}

const segmentsPartialMap = readSegmentsPartialMap();

const getMinPerKm = ({ distance, seconds }) => {
    const distanceInKm = distance / 1000.0;
    const minutes = seconds / 60.0;
    return distanceInKm > 0 ? minutes / distanceInKm : 0;
};

const transform = async (elem) => {
    const distance = elem["Distance (metres)"];
    const first = elem["KOM (seconds)"];
    const partial = segmentsPartialMap[elem.ID];
    const data = {
        "id": elem.ID,
        "name": elem.Name,
        "distance": distance,
        "grade": elem["Grade (%)"],
        "first": elem["KOM (seconds)"],
        "athletesCount": elem.Athletes,
        "firstMinPerKm": getMinPerKm({
            distance: distance,
            seconds: first
        })
    };
    if (partial) {
        data.start_latlng = partial.start_latlng;
        data.end_latlng = partial.end_latlng;
    }
    return data;
}

const segments = readAndLogSegments();
const transformed = [];
for (const segment of segments) {
    const result = await transform(segment);
    const html = await fetchSegmentById(result.id);
    const parsed = parseHtml(html);
    transformed.push({ ...result, ...parsed });
    fs.writeFileSync(path.join(__dirname, 'transformed-segments-partial.json'), JSON.stringify(transformed, null, 2), 'utf8');
}

fs.writeFileSync(path.join(__dirname, 'transformed-segments.json'), JSON.stringify(transformed, null, 2), 'utf8');