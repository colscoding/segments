import csv from 'csv-parser';
import fs from 'fs';

const results = [];

fs.createReadStream('SegmentsRunning.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        fs.writeFileSync('segments.json', JSON.stringify(results, null, 2));
        console.log('CSV file successfully processed');
    });
