const express = require('express');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');

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

    console.log('Downloading audio for:', songTitle);

    // Download the audio stream using ytdl-core and save it to a temporary file
    const audioPath = `./${songTitle}.mp3`;
    ytdl(videoURL, { filter: 'audioonly' })
      .pipe(fs.createWriteStream(audioPath))
      .on('finish', () => {
        // Set content headers for streaming
        res.set('Content-Type', 'audio/mpeg');
        res.set('Content-Disposition', `attachment; filename="${songTitle}.mp3"`); // Force download as an attachment

        // Stream the audio file directly to the client
        fs.createReadStream(audioPath).pipe(res);

        console.log('Audio streaming complete.');
      });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "An error occurred while processing your request. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
