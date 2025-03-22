async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://kaido.to/search?q=${encodedKeyword}`);
        const html = await response.text();

        let results = [];
        const regex = /<div class="flw-item.*?">.*?<a href="(\/watch\/[^"]+)"[^>]*>(.*?)<\/a>.*?data-src="([^"]+)"/gs;

        let match;
        while ((match = regex.exec(html)) !== null) {
            results.push({
                title: match[2].trim(),
                image: match[3],
                href: `https://kaido.to${match[1]}`
            });
        }

        return JSON.stringify(results);
    } catch (error) {
        console.error("Search fetch error:", error);
        return JSON.stringify([{ title: "Error", image: "", href: "" }]);
    }
}

async function extractDetails(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const descriptionMatch = html.match(/<div class="film-description">(.*?)<\/div>/s);
        const durationMatch = html.match(/<span>Duration:\s*<\/span>\s*([^<]+)/);
        const airdateMatch = html.match(/<span>Released:\s*<\/span>\s*([^<]+)/);

        return JSON.stringify([{
            description: descriptionMatch ? descriptionMatch[1].trim() : "No description available",
            aliases: `Duration: ${durationMatch ? durationMatch[1].trim() : "Unknown"}`,
            airdate: `Aired: ${airdateMatch ? airdateMatch[1].trim() : "Unknown"}`
        }]);
    } catch (error) {
        console.error("Details fetch error:", error);
        return JSON.stringify([{ description: "Error loading description", aliases: "Duration: Unknown", airdate: "Aired: Unknown" }]);
    }
}

async function extractEpisodes(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        let episodes = [];
        const regex = /<a href="(\/watch\/[^"]+\/episode-\d+)">.*?Episode (\d+)/gs;

        let match;
        while ((match = regex.exec(html)) !== null) {
            episodes.push({
                href: `https://kaido.to${match[1]}`,
                number: match[2]
            });
        }

        return JSON.stringify(episodes);
    } catch (error) {
        console.error("Episode fetch error:", error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const match = html.match(/<iframe[^>]+src="([^"]+)"/);
        return match ? match[1] : null;
    } catch (error) {
        console.error("Stream fetch error:", error);
        return null;
    }
}
