/**************************************
 * Kaido.to Sora Module (Regex-based) *
 **************************************/

/**
 * Fetches the search results page from Kaido.to using ?keyword=,
 * parses the HTML with regex, and returns an array of anime objects.
 */
async function searchAnime(query) {
    try {
        const encoded = encodeURIComponent(query);
        // Potential search URL; may or may not return actual results
        const url = `https://kaido.to/search?keyword=${encoded}`;

        const response = await fetch(url);
        const html = await response.text();

        return searchResults(html);
    } catch (error) {
        console.error("searchAnime error:", error);
        return [];
    }
}

/**
 * Regex-based parsing for the search page HTML.
 * Looks for flw-item blocks, extracting { title, image, href }.
 */
function searchResults(html) {
    const results = [];
    const filmListRegex = /<div class="flw-item.*?">[\s\S]*?<\/div>\s*<\/div>/g;
    const items = html.match(filmListRegex) || [];

    items.forEach((itemHtml) => {
        const titleMatch = itemHtml.match(/<a href="([^"]+)"[^>]*title="([^"]+)"/);
        const href = titleMatch ? `https://kaido.to${titleMatch[1]}` : '';
        const title = titleMatch ? titleMatch[2] : '';

        const imgMatch = itemHtml.match(/<img[^>]*data-src="([^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : '';

        if (title && href) {
            results.push({
                title: title.trim(),
                image: imageUrl.trim(),
                href: href.trim()
            });
        }
    });

    console.log("searchResults:", results);
    return results;
}

/**
 * Fetches the anime detail page, parses the HTML, and returns
 * { description, alias, airdate }.
 */
async function getAnimeDetails(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        return extractDetails(html);
    } catch (error) {
        console.error("getAnimeDetails error:", error);
        return {
            description: "Error",
            alias: "Unknown",
            airdate: "Unknown"
        };
    }
}

/**
 * Regex-based parsing for the anime's detail page.
 */
function extractDetails(html) {
    const details = [];

    const descriptionMatch = html.match(/<div class="film-description">(.*?)<\/div>/s);
    const description = descriptionMatch ? descriptionMatch[1].trim() : 'N/A';

    const airdateMatch = html.match(/<span>Released:\s*<\/span>\s*([^<]+)/);
    const airdate = airdateMatch ? airdateMatch[1].trim() : 'N/A';

    const episodesMatch = html.match(/<span>Total Episodes:\s*<\/span>\s*(\d+)/);
    const aliases = episodesMatch ? episodesMatch[1].trim() : 'N/A';

    details.push({
        description,
        alias: "Episodes: " + aliases,
        airdate
    });

    console.log("extractDetails:", details);
    return details[0]; // Return the first object for convenience
}

/**
 * Fetches the anime page, parses the HTML, and returns an array of
 * episodes in the format { href, number }.
 */
async function getAnimeEpisodes(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        return extractEpisodes(html);
    } catch (error) {
        console.error("getAnimeEpisodes error:", error);
        return [];
    }
}

/**
 * Regex-based parsing of the anime's episodes list.
 */
function extractEpisodes(html) {
    const episodes = [];
    const episodeMatches = html.match(/<a href="([^"]+)"[^>]*class="btn-play"[^>]*>Episode (\d+)<\/a>/g);

    if (episodeMatches) {
        episodeMatches.forEach(match => {
            const hrefMatch = match.match(/href="([^"]+)"/);
            const numberMatch = match.match(/Episode (\d+)/);

            if (hrefMatch && numberMatch) {
                episodes.push({
                    href: `https://kaido.to${hrefMatch[1]}`,
                    number: numberMatch[1]
                });
            }
        });
    }

    console.log("extractEpisodes:", episodes);
    return episodes;
}

/**
 * Extracts the streaming URL from the episode page HTML:
 * 1. Finds the <iframe src="...">
 * 2. Fetches that iframe
 * 3. Searches for file: '...m3u8'
 */
async function extractStreamUrl(html) {
    const iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/);

    if (iframeMatch) {
        const streamUrl = iframeMatch[1];
        console.log("Iframe URL:", streamUrl);

        const response = await fetch(streamUrl);
        const newHtml = await response.text();

        const m3u8Match = newHtml.match(/file:\s*'([^']+\.m3u8)'/);
        if (m3u8Match) {
            const videoUrl = m3u8Match[1];
            console.log("M3U8 URL:", videoUrl);
            return videoUrl;
        } else {
            console.log("No m3u8 URL found.");
            return null;
        }
    } else {
        console.log("No iframe found.");
        return null;
    }
}

// Export all functions for use in your Sora module or other scripts
export {
    searchAnime,
    getAnimeDetails,
    getAnimeEpisodes,
    extractStreamUrl
};
