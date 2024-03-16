const express = require('express');
const { getVideoMP3Base64 } = require('yt-get');
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

    // Get Base64-encoded MP3 of the video
    const { base64 } = await getVideoMP3Base64(videoURL);

    // Convert Base64 to binary buffer
    const buffer = Buffer.from(base64, 'base64');

    // Set content headers for streaming
    res.set('Content-Type', 'audio/mpeg');

    // Stream the audio buffer to the client
    const audioStream = new Readable();
    audioStream._read = () => {}; // Necessary for Readable streams
    audioStream.push(buffer);
    audioStream.push(null); // Signal the end of the stream

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
