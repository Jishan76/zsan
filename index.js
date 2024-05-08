const express = require('express');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/search', async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ error: "Please provide a search term" });
  }

  try {
    // Perform a YouTube search using the yt-search library
    const searchResults = await ytSearch(searchTerm);
    if (!searchResults.videos || searchResults.videos.length === 0) {
      return res.status(404).json({ error: "No search results found for the given term" });
    }

    // Get the first search result and its video URL
    const firstResult = searchResults.videos[0];
    const videoURL = firstResult.url;
    const songTitle = firstResult.title;

    console.log('Streaming audio for:', songTitle);

    // Get the audio stream using ytdl-core
    const audioStream = ytdl(videoURL, { filter: 'audioonly' });

    // Set content headers for streaming
    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Disposition', `inline; filename="${songTitle}.mp3"`);

    // Stream the audio directly to the client
    audioStream.pipe(res);

    audioStream.on('end', () => {
      console.log('Audio stream complete.');
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "An error occurred while processing your request. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
