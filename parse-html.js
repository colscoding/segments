function parseAttempts(html) {
    const regex = /<div class="stat attempts">.*?<span class="stat-subtext">([\d,]+) Attempts By ([\d,]+) People<\/span>/i;
    const match = html.match(regex);
    if (!match) return null;
    return {
        attempts: parseInt(match[1].replace(/,/g, ''), 10),
        people: parseInt(match[2].replace(/,/g, ''), 10)
    };
}

function parseLeaderboard(html) {
    const tableRegex = /<table.*?>(.*?)<\/table>/gis;
    const tableMatch = html.match(tableRegex);
    if (!tableMatch) return [];

    const tbodyRegex = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i;
    const tbodyMatch = tableMatch[0].match(tbodyRegex);
    if (!tbodyMatch) return [];

    const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
    const rows = [];
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tbodyMatch[1])) !== null) {
        const cols = [];
        const colRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
        let colMatch;
        while ((colMatch = colRegex.exec(rowMatch[1])) !== null) {
            // Remove HTML tags and trim
            cols.push(colMatch[1].replace(/<[^>]+>/g, '').trim());
        }
        if (cols.length >= 4) {
            rows.push({
                position: parseInt(cols[0], 10),
                pace: cols[2].replace(/\s+\/km/g, ''),
                time: cols[3]
            });
        }
    }
    return rows;
}

function parseHtml(html) {
    try {
        return {
            attempts: parseAttempts(html),
            leaderboard: parseLeaderboard(html)
        };
    } catch (error) {
        console.error("Error parsing HTML:", error);
    }
    return {};
}

export { parseHtml };