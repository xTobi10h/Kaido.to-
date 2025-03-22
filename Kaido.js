/**
 * Kaido.to module for Sora
 */

const BASE_URL = "https://kaido.to";

// Search for anime titles
async function searchAnime(query) {
    const searchUrl = `${BASE_URL}/search?keyword=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    let results = [];
    doc.querySelectorAll(".film_list-wrap .flw-item").forEach(item => {
        const titleTag = item.querySelector(".film-name a");
        const imgTag = item.querySelector(".film-poster img");
        if (titleTag && imgTag) {
            results.push({
                title: titleTag.textContent.trim(),
                url: BASE_URL + titleTag.getAttribute("href"),
                image: imgTag.getAttribute("data-src")
            });
        }
    });

    return results;
}

// Get episode list from an anime page
async function getEpisodeList(animeUrl) {
    const response = await fetch(animeUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    let episodes = [];
    doc.querySelectorAll(".episodes li a").forEach(a => {
        episodes.push({
            title: a.textContent.trim(),
            url: BASE_URL + a.getAttribute("href")
        });
    });

    return episodes.reverse(); // Sort episodes correctly
}

// Get streaming URL from an episode page
async function getVideoUrl(episodeUrl) {
    const response = await fetch(episodeUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const iframe = doc.querySelector("iframe");
    return iframe ? iframe.src : null;
}

// Export functions
export { searchAnime, getEpisodeList, getVideoUrl };
