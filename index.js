const express = require('express');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const app = express();
const PORT = 3000;

// Route for getting direct link to video
app.get('/get-video-link', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    // Search for videos using yt-search
    const { videos } = await ytSearch(query);

    if (!videos.length) {
      return res.status(404).json({ error: 'No videos found' });
    }

    // Get the first video
    const firstVideo = videos[0];

    // Get video details
    const videoInfo = await ytdl.getInfo(firstVideo.url);

    // Get the direct video download URL
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
    if (!videoFormat) {
      return res.status(404).json({ error: 'No video format found' });
    }

    const videoUrl = videoFormat.url;
    res.json({ videoUrl });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for getting direct link to audio
app.get('/get-audio-link', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    // Search for videos using yt-search
    const { videos } = await ytSearch(query);

    if (!videos.length) {
      return res.status(404).json({ error: 'No videos found' });
    }

    // Get the first video
    const firstVideo = videos[0];

    // Get video details
    const videoInfo = await ytdl.getInfo(firstVideo.url);

    // Get the direct audio download URL
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    if (!audioFormat) {
      return res.status(404).json({ error: 'No audio format found' });
    }

    const audioUrl = audioFormat.url;
    res.json({ audioUrl });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
