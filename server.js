import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3000;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static('public'));

app.get('/api/segments', async (req, res) => {
    try {
        const data = await fs.readFile('transformed-segments-partial.json', 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading data');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
