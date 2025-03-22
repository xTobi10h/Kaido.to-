async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://kaido.to/api/search?q=${encodedKeyword}`);
        const data = await response.json();
        
        const transformedResults = data.results.map(anime => ({
            title: anime.title,
            image: anime.image,
            href: `https://kaido.to/anime/${anime.id}`
        }));
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/kaido\.to\/anime\/(.+)$/);
        if (!match) throw new Error('Invalid URL format');
        
        const animeId = match[1];
        const response = await fetch(`https://kaido.to/api/anime/${animeId}`);
        const data = await response.json();
        
        const animeInfo = data.anime;
        
        const transformedResults = [{
            description: animeInfo.description || 'No description available',
            aliases: `Duration: ${animeInfo.duration || 'Unknown'}`,
            airdate: `Aired: ${animeInfo.aired || 'Unknown'}`
        }];
        
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const match = url.match(/https:\/\/kaido\.to\/anime\/(.+)$/);
        if (!match) throw new Error('Invalid URL format');
        
        const animeId = match[1];
        const response = await fetch(`https://kaido.to/api/anime/${animeId}/episodes`);
        const data = await response.json();

        const transformedResults = data.episodes.map(episode => ({
            href: `https://kaido.to/watch/${episode.id}`,
            number: episode.number
        }));
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/kaido\.to\/watch\/(.+)$/);
        if (!match) throw new Error('Invalid URL format');
        
        const episodeId = match[1];
        const response = await fetch(`https://kaido.to/api/episode/${episodeId}/sources`);
        const data = await response.json();
        
        const hlsSource = data.sources.find(source => source.type === 'hls');
        
        return hlsSource ? hlsSource.url : null;
    } catch (error) {
        console.log('Fetch error:', error);
        return null;
    }
}
